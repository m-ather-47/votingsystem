import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
import { authenticateToken } from "@/lib/utils";

export async function GET(req) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const userId = authenticateToken(cookieStore);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Access." },
      { status: 401 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const electionId = searchParams.get("electionId");
  const positionId = searchParams.get("positionId");

  let query = supabase.from("candidates").select();
  if (electionId) {
    query = query.eq("election_id", electionId);
  }
  if (positionId) {
    query = query.eq("position_id", positionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch candidates." },
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
  const { name, party, position, positionId, electionId, photo, image } =
    payload || {};

  if (!name || !party) {
    return NextResponse.json(
      { success: false, message: "Please provide all candidate details." },
      { status: 400 }
    );
  }

  let positionName = position || "";
  let linkedElectionId = electionId || null;

  if (positionId && (!positionName || !linkedElectionId)) {
    const { data: positionRow, error: positionError } = await supabase
      .from("positions")
      .select("name, election_id")
      .eq("id", positionId)
      .maybeSingle();

    if (positionError || !positionRow) {
      return NextResponse.json(
        { success: false, message: "Invalid position selected." },
        { status: 400 }
      );
    }

    positionName = positionName || positionRow.name;
    linkedElectionId = linkedElectionId || positionRow.election_id;
  }

  if (!positionName) {
    return NextResponse.json(
      { success: false, message: "Position is required." },
      { status: 400 }
    );
  }

  const candidatePayload = {
    name,
    party,
    position: positionName,
    position_id: positionId || null,
    election_id: linkedElectionId,
    photo: photo || image || null,
  };

  const { data, error } = await supabase
    .from("candidates")
    .insert(candidatePayload)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Error creating candidate" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Candidate created successfully", data },
    { status: 200 }
  );
}
