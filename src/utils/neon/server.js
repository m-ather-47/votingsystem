"use server";

import { Pool } from "pg";

const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set NEON_DATABASE_URL or DATABASE_URL."
  );
}

const globalForDb = globalThis;

if (!globalForDb.__neonPool) {
  globalForDb.__neonPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function splitTopLevelComma(input) {
  const text = String(input || "");
  const parts = [];
  let depth = 0;
  let current = "";

  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function toSelectSql(selectText) {
  const normalized = (selectText || "*").trim();
  if (normalized === "*") return "*";

  const tokens = splitTopLevelComma(normalized);
  if (tokens.some((token) => token.includes("("))) {
    throw Object.assign(new Error("Nested select relations are not supported in this query path."), {
      code: "NEON_NESTED_SELECT_UNSUPPORTED",
    });
  }

  return tokens.map((token) => quoteIdentifier(token)).join(", ");
}

class NeonQueryBuilder {
  constructor(pool, table) {
    this.pool = pool;
    this.table = table;
    this.operation = "select";
    this.selectColumns = "*";
    this.filters = [];
    this.orders = [];
    this.payload = null;
    this.returning = false;
    this.returningColumns = "*";
    this.singleMode = null;
    this.countMode = null;
    this.head = false;
    this.onConflict = null;
  }

  select(columns = "*", options = {}) {
    if (["insert", "update", "delete", "upsert"].includes(this.operation)) {
      this.returning = true;
      this.returningColumns = columns || "*";
      return this;
    }

    this.selectColumns = columns || "*";
    this.countMode = options?.count || null;
    this.head = Boolean(options?.head);
    return this;
  }

  insert(values) {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  update(values) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  upsert(values, options = {}) {
    this.operation = "upsert";
    this.payload = values;
    this.onConflict = options?.onConflict || null;
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: "in", column, values: Array.isArray(values) ? values : [] });
    return this;
  }

  match(criteria = {}) {
    Object.entries(criteria).forEach(([column, value]) => {
      this.eq(column, value);
    });
    return this;
  }

  is(column, value) {
    this.filters.push({ type: "is", column, value });
    return this;
  }

  order(column, options = {}) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  _buildWhereClause(startIndex = 1) {
    const clauses = [];
    const params = [];
    let idx = startIndex;

    for (const filter of this.filters) {
      const columnSql = quoteIdentifier(filter.column);

      if (filter.type === "eq") {
        if (filter.value === null) {
          clauses.push(`${columnSql} IS NULL`);
        } else {
          clauses.push(`${columnSql} = $${idx}`);
          params.push(filter.value);
          idx += 1;
        }
      }

      if (filter.type === "in") {
        if (!filter.values || filter.values.length === 0) {
          clauses.push("1 = 0");
        } else {
          clauses.push(`${columnSql} = ANY($${idx})`);
          params.push(filter.values);
          idx += 1;
        }
      }

      if (filter.type === "is") {
        if (filter.value === null) {
          clauses.push(`${columnSql} IS NULL`);
        } else {
          clauses.push(`${columnSql} IS NOT DISTINCT FROM $${idx}`);
          params.push(filter.value);
          idx += 1;
        }
      }
    }

    return {
      sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
      params,
      nextIndex: idx,
    };
  }

  _buildOrderClause() {
    if (!this.orders.length) return "";

    const orderSql = this.orders
      .map(
        (order) =>
          `${quoteIdentifier(order.column)} ${order.ascending ? "ASC" : "DESC"}`
      )
      .join(", ");

    return ` ORDER BY ${orderSql}`;
  }

  async _executeSelect() {
    const tableSql = quoteIdentifier(this.table);
    const where = this._buildWhereClause();
    const order = this._buildOrderClause();

    let count = null;
    if (this.countMode === "exact") {
      const countQuery = `SELECT COUNT(*)::int AS count FROM ${tableSql}${where.sql}`;
      const countResult = await this.pool.query(countQuery, where.params);
      count = countResult.rows[0]?.count ?? 0;
    }

    if (this.head) {
      return { data: null, error: null, count };
    }

    const selectSql = toSelectSql(this.selectColumns);
    const query = `SELECT ${selectSql} FROM ${tableSql}${where.sql}${order}`;
    const result = await this.pool.query(query, where.params);

    if (this.singleMode === "maybeSingle") {
      return { data: result.rows[0] ?? null, error: null, count };
    }

    return { data: result.rows, error: null, count };
  }

  async _executeInsertLike({ upsert = false }) {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
    const validRows = rows.filter((row) => row && typeof row === "object");

    if (!validRows.length) {
      return {
        data: this.returning ? [] : null,
        error: { message: "No payload provided for write operation." },
        count: null,
      };
    }

    const columns = Array.from(
      validRows.reduce((set, row) => {
        Object.keys(row).forEach((key) => {
          if (row[key] !== undefined) set.add(key);
        });
        return set;
      }, new Set())
    );

    if (!columns.length) {
      return {
        data: this.returning ? [] : null,
        error: { message: "No valid columns found for write operation." },
        count: null,
      };
    }

    const tableSql = quoteIdentifier(this.table);
    const columnSql = columns.map((column) => quoteIdentifier(column)).join(", ");

    const params = [];
    let idx = 1;
    const valueSql = validRows
      .map((row) => {
        const placeholders = columns.map((column) => {
          params.push(row[column] ?? null);
          const placeholder = `$${idx}`;
          idx += 1;
          return placeholder;
        });
        return `(${placeholders.join(", ")})`;
      })
      .join(", ");

    let conflictSql = "";
    if (upsert && this.onConflict) {
      const conflictColumns = this.onConflict
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const updateColumns = columns.filter(
        (column) => !conflictColumns.includes(column)
      );

      const conflictTarget = conflictColumns.map((column) => quoteIdentifier(column)).join(", ");

      if (!updateColumns.length) {
        conflictSql = ` ON CONFLICT (${conflictTarget}) DO NOTHING`;
      } else {
        const assignments = updateColumns
          .map(
            (column) =>
              `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`
          )
          .join(", ");
        conflictSql = ` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${assignments}`;
      }
    }

    const returningSql = this.returning
      ? ` RETURNING ${toSelectSql(this.returningColumns)}`
      : "";

    const query = `INSERT INTO ${tableSql} (${columnSql}) VALUES ${valueSql}${conflictSql}${returningSql}`;
    const result = await this.pool.query(query, params);

    if (!this.returning) {
      return { data: null, error: null, count: null };
    }

    if (this.singleMode === "maybeSingle") {
      return { data: result.rows[0] ?? null, error: null, count: null };
    }

    return { data: result.rows, error: null, count: null };
  }

  async _executeUpdate() {
    const payload = this.payload && typeof this.payload === "object" ? this.payload : {};
    const updates = Object.entries(payload).filter(([, value]) => value !== undefined);

    if (!updates.length) {
      return {
        data: this.returning ? [] : null,
        error: { message: "No fields to update." },
        count: null,
      };
    }

    const tableSql = quoteIdentifier(this.table);
    const setClauses = [];
    const params = [];
    let idx = 1;

    for (const [column, value] of updates) {
      setClauses.push(`${quoteIdentifier(column)} = $${idx}`);
      params.push(value);
      idx += 1;
    }

    const where = this._buildWhereClause(idx);
    const returningSql = this.returning
      ? ` RETURNING ${toSelectSql(this.returningColumns)}`
      : "";

    const query = `UPDATE ${tableSql} SET ${setClauses.join(", ")}${where.sql}${returningSql}`;
    const result = await this.pool.query(query, [...params, ...where.params]);

    if (!this.returning) {
      return { data: null, error: null, count: null };
    }

    if (this.singleMode === "maybeSingle") {
      return { data: result.rows[0] ?? null, error: null, count: null };
    }

    return { data: result.rows, error: null, count: null };
  }

  async _executeDelete() {
    const tableSql = quoteIdentifier(this.table);
    const where = this._buildWhereClause();
    const returningSql = this.returning
      ? ` RETURNING ${toSelectSql(this.returningColumns)}`
      : "";

    const query = `DELETE FROM ${tableSql}${where.sql}${returningSql}`;
    const result = await this.pool.query(query, where.params);

    if (!this.returning) {
      return { data: null, error: null, count: null };
    }

    if (this.singleMode === "maybeSingle") {
      return { data: result.rows[0] ?? null, error: null, count: null };
    }

    return { data: result.rows, error: null, count: null };
  }

  async execute() {
    try {
      if (this.operation === "select") {
        return await this._executeSelect();
      }

      if (this.operation === "insert") {
        return await this._executeInsertLike({ upsert: false });
      }

      if (this.operation === "upsert") {
        return await this._executeInsertLike({ upsert: true });
      }

      if (this.operation === "update") {
        return await this._executeUpdate();
      }

      if (this.operation === "delete") {
        return await this._executeDelete();
      }

      return { data: null, error: { message: "Unsupported operation." }, count: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error?.message || "Database query failed.",
          code: error?.code,
        },
        count: null,
      };
    }
  }
}

class NeonClient {
  constructor(pool) {
    this.pool = pool;
  }

  from(table) {
    return new NeonQueryBuilder(this.pool, table);
  }
}

export async function createClient() {
  return new NeonClient(globalForDb.__neonPool);
}
