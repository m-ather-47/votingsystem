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

  const [
    votersRes,
    candidatesRes,
    positionsRes,
    electionsRes,
    votesRes,
    candidatesMapRes,
    electionsDetailRes,
    positionRowsRes,
  ] = await Promise.all([
    supabase.from("voters").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase.from("positions").select("id", { count: "exact", head: true }),
    supabase.from("elections").select("id", { count: "exact", head: true }),
    supabase.from("votes").select("voter_cnic, candidate_id"),
    supabase.from("candidates").select("id, election_id"),
    supabase
      .from("elections")
      .select("id, name, status")
      .order("created_at", { ascending: false }),
    supabase.from("positions").select("id, election_id"),
  ]);

  if (
    votersRes.error ||
    candidatesRes.error ||
    positionsRes.error ||
    electionsRes.error ||
    votesRes.error ||
    candidatesMapRes.error ||
    electionsDetailRes.error ||
    positionRowsRes.error
  ) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats." },
      { status: 400 }
    );
  }

  const voterCount = votersRes.count ?? 0;
  const candidateCount = candidatesRes.count ?? 0;
  const positionCount = positionsRes.count ?? 0;
  const electionCount = electionsRes.count ?? 0;
  const votes = votesRes.data || [];
  const candidatesMap = candidatesMapRes.data || [];
  const electionsDetail = electionsDetailRes.data || [];
  const positionRows = positionRowsRes.data || [];
  const distinctVoters = new Set(votes.map((vote) => vote.voter_cnic)).size;
  const turnout = voterCount > 0 ? (distinctVoters / voterCount) * 100 : 0;

  const positionCountByElection = new Map();
  positionRows.forEach((position) => {
    if (!position.election_id) return;
    positionCountByElection.set(
      position.election_id,
      (positionCountByElection.get(position.election_id) || 0) + 1
    );
  });

  const candidateToElection = new Map(
    candidatesMap
      .filter((candidate) => candidate.election_id)
      .map((candidate) => [candidate.id, candidate.election_id])
  );

  const perElectionMap = new Map();
  electionsDetail.forEach((election) => {
    perElectionMap.set(election.id, {
      electionId: election.id,
      name: election.name,
      status: election.status,
      positions: positionCountByElection.get(election.id) || 0,
      candidates: 0,
      votes: 0,
      voters: new Set(),
    });
  });

  candidatesMap.forEach((candidate) => {
    if (!candidate.election_id) return;
    const entry = perElectionMap.get(candidate.election_id);
    if (entry) {
      entry.candidates += 1;
    }
  });

  votes.forEach((vote) => {
    const electionId = candidateToElection.get(vote.candidate_id);
    if (!electionId) return;
    const entry = perElectionMap.get(electionId);
    if (!entry) return;
    entry.votes += 1;
    entry.voters.add(vote.voter_cnic);
  });

  const perElection = Array.from(perElectionMap.values()).map((entry) => ({
    electionId: entry.electionId,
    name: entry.name,
    status: entry.status,
    positions: entry.positions,
    candidates: entry.candidates,
    votes: entry.votes,
    turnout: voterCount > 0 ? (entry.voters.size / voterCount) * 100 : 0,
  }));

  return NextResponse.json({
    success: true,
    data: {
      voters: voterCount,
      candidates: candidateCount,
      positions: positionCount,
      elections: electionCount,
      votes: votes.length,
      turnout,
      perElection,
    },
  });
}
