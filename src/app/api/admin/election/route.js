import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { authenticateToken } from "@/lib/utils";

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

  const { data, error } = await supabase
    .from("elections")
    .select(
      "id, name, status, created_at, positions(id, name, created_at, candidates(id, name, party, position, photo, position_id, election_id, created_at))"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch elections." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
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
