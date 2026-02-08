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
      "id, name, status, created_at, positions(id, name, candidates(id, name, party, position, photo, position_id))"
    )
    .eq("status", "Active")
    .order("created_at", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch election." },
      { status: 400 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { success: false, message: "No active elections found." },
      { status: 404 }
    );
  }

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
