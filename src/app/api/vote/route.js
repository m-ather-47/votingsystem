import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
import { authenticateToken, isDemoUser } from "@/lib/utils";

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
      { success: true, message: "Vote recorded successfully." },
      { status: 200 }
    );
  }

  const payload = await req.json();
  const { electionId, votes } = payload || {};

  if (!electionId) {
    return NextResponse.json(
      { success: false, message: "Election is required." },
      { status: 400 }
    );
  }

  if (!votes || typeof votes !== "object") {
    return NextResponse.json(
      { success: false, message: "Invalid vote payload." },
      { status: 400 }
    );
  }

  const candidateIds = Object.values(votes).filter(Boolean);
  if (candidateIds.length === 0) {
    return NextResponse.json(
      { success: false, message: "No candidates selected." },
      { status: 400 }
    );
  }

  const { data: voterRow, error: voterError } = await supabase
    .from("voters")
    .select("id")
    .eq("cnic", userId)
    .maybeSingle();

  if (voterError || !voterRow) {
    return NextResponse.json(
      { success: false, message: "Voter not found." },
      { status: 400 }
    );
  }

  const { data: voterElection, error: voterElectionError } = await supabase
    .from("voter_elections")
    .select("status")
    .eq("voter_cnic", userId)
    .eq("election_id", electionId)
    .maybeSingle();

  if (voterElectionError) {
    return NextResponse.json(
      { success: false, message: "Failed to validate voter status." },
      { status: 400 }
    );
  }

  if (voterElection?.status === "Voted") {
    return NextResponse.json(
      { success: false, message: "You have already voted in this election." },
      { status: 400 }
    );
  }

  let candidatesQuery = supabase
    .from("candidates")
    .select("id, position, election_id")
    .in("id", candidateIds)
    .eq("election_id", electionId);

  const { data: candidates, error: candidatesError } = await candidatesQuery;

  if (candidatesError) {
    return NextResponse.json(
      { success: false, message: "Failed to validate candidates." },
      { status: 400 }
    );
  }

  if (!candidates || candidates.length !== candidateIds.length) {
    return NextResponse.json(
      { success: false, message: "Invalid candidate selection." },
      { status: 400 }
    );
  }

  const voteRows = candidates.map((candidate) => ({
    voter_cnic: userId,
    candidate_id: candidate.id,
    election_id: electionId,
    position: candidate.position,
  }));

  const { error: voteInsertError } = await supabase.from("votes").insert(voteRows);

  if (voteInsertError) {
    const isDuplicate = voteInsertError.code === "23505";
    return NextResponse.json(
      {
        success: false,
        message: isDuplicate ? "You have already voted." : "Failed to cast vote.",
      },
      { status: 400 }
    );
  }

  const { error: voterElectionUpdateError } = await supabase
    .from("voter_elections")
    .upsert(
      {
        voter_cnic: userId,
        election_id: electionId,
        status: "Voted",
        voted_at: new Date().toISOString(),
      },
      { onConflict: "voter_cnic,election_id" }
    );

  if (voterElectionUpdateError) {
    return NextResponse.json(
      { success: false, message: "Failed to update voter status." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Vote recorded successfully." },
    { status: 200 }
  );
}
