import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
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

  const { data: electionRows, error: electionError } = await supabase
    .from("elections")
    .select("id, name, status, created_at")
    .eq("status", "Active")
    .order("created_at", { ascending: false })
    .order("name", { ascending: true });

  if (electionError) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch election." },
      { status: 400 }
    );
  }

  if (!electionRows || electionRows.length === 0) {
    return NextResponse.json(
      { success: false, message: "No active elections found." },
      { status: 404 }
    );
  }

  const electionIds = electionRows.map((row) => row.id);
  const { data: positionRows, error: positionError } = await supabase
    .from("positions")
    .select("id, name, election_id")
    .in("election_id", electionIds);

  if (positionError) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch election." },
      { status: 400 }
    );
  }

  const positionIds = (positionRows || []).map((row) => row.id);
  const { data: candidateRows, error: candidateError } = positionIds.length
    ? await supabase
        .from("candidates")
        .select("id, name, party, position, photo, position_id")
        .in("position_id", positionIds)
    : { data: [], error: null };

  if (candidateError) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch election." },
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

  const positionsByElection = new Map();
  (positionRows || []).forEach((position) => {
    const electionKey = position.election_id;
    if (!positionsByElection.has(electionKey)) {
      positionsByElection.set(electionKey, []);
    }
    positionsByElection.get(electionKey).push({
      id: position.id,
      name: position.name,
      candidates: candidatesByPosition.get(position.id) || [],
    });
  });

  const data = electionRows.map((election) => ({
    ...election,
    positions: positionsByElection.get(election.id) || [],
  }));

  const { data: voterElections, error: voterElectionsError } = await supabase
    .from("voter_elections")
    .select("election_id, status")
    .eq("voter_cnic", userId);

  if (voterElectionsError) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch voter status." },
      { status: 400 }
    );
  }

  const voterStatusMap = new Map(
    (voterElections || []).map((row) => [row.election_id, row.status])
  );

  const elections = data.map((election) => ({
    electionId: election.id,
    name: election.name,
    status: election.status,
    voterStatus: voterStatusMap.get(election.id) || "Not Voted",
    positions: (election.positions || []).map((position) => ({
      positionId: position.id,
      name: position.name,
      candidates: (position.candidates || []).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        photo: candidate.photo,
        positionId: candidate.position_id,
      })),
    })),
  }));

  return NextResponse.json({ success: true, data: { elections } });
}
