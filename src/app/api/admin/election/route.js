import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
import { authenticateToken, isDemoUser } from "@/lib/utils";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const userId = authenticateToken(cookieStore);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Access." },
      { status: 401 }
    );
  }

  const { data: electionRows, error: electionError } = await supabase
    .from("elections")
    .select("id, name, status, created_at")
    .order("created_at", { ascending: false });

  if (electionError) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch elections." },
      { status: 400 }
    );
  }

  const electionIds = (electionRows || []).map((row) => row.id);

  let positionsByElection = new Map();
  if (electionIds.length > 0) {
    const { data: positionRows, error: positionError } = await supabase
      .from("positions")
      .select("id, name, created_at, election_id")
      .in("election_id", electionIds);

    if (positionError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch elections." },
        { status: 400 }
      );
    }

    const positionIds = (positionRows || []).map((row) => row.id);
    const { data: candidateRows, error: candidateError } = positionIds.length
      ? await supabase
          .from("candidates")
          .select(
            "id, name, party, position, photo, position_id, election_id, created_at"
          )
          .in("position_id", positionIds)
      : { data: [], error: null };

    if (candidateError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch elections." },
        { status: 400 }
      );
    }

    const candidatesByPosition = new Map();
    (candidateRows || []).forEach((candidate) => {
      const key = candidate.position_id;
      if (!candidatesByPosition.has(key)) {
        candidatesByPosition.set(key, []);
      }
      candidatesByPosition.get(key).push(candidate);
    });

    (positionRows || []).forEach((position) => {
      const electionKey = position.election_id;
      if (!positionsByElection.has(electionKey)) {
        positionsByElection.set(electionKey, []);
      }
      positionsByElection.get(electionKey).push({
        id: position.id,
        name: position.name,
        created_at: position.created_at,
        candidates: candidatesByPosition.get(position.id) || [],
      });
    });
  }

  const data = (electionRows || []).map((election) => ({
    ...election,
    positions: positionsByElection.get(election.id) || [],
  }));

  return NextResponse.json({ success: true, data });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const userId = authenticateToken(cookieStore);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Access." },
      { status: 401 }
    );
  }

  if (isDemoUser(userId)) {
    return NextResponse.json(
      { success: true, message: "Election created successfully" },
      { status: 200 }
    );
  }

  const payload = await req.json();
  const { name, status } = payload || {};

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Please provide election name." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("elections")
    .insert({ name, status: status || "Active" })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create election." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Election created successfully", data },
    { status: 200 }
  );
}
