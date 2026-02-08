import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { authenticateToken } from "@/lib/utils";

export async function PATCH(req, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const userId = authenticateToken(cookieStore);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Access." },
      { status: 401 }
    );
  }

  const candidateId = params?.candidateId;
  if (!candidateId) {
    return NextResponse.json(
      { success: false, message: "Invalid candidate id." },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const { name, party, photo, image, positionId, position, electionId } =
    payload || {};

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

  const payloadUpdates = {
    ...(name ? { name } : {}),
    ...(party ? { party } : {}),
    ...(positionName ? { position: positionName } : {}),
    ...(positionId ? { position_id: positionId } : {}),
    ...(linkedElectionId ? { election_id: linkedElectionId } : {}),
    ...(photo || image ? { photo: photo || image } : {}),
  };

  if (Object.keys(payloadUpdates).length === 0) {
    return NextResponse.json(
      { success: false, message: "Nothing to update." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("candidates")
    .update(payloadUpdates)
    .eq("id", candidateId)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: "Error updating candidate" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Candidate updated successfully", data },
    { status: 200 }
  );
}

export async function DELETE(req, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const userId = authenticateToken(cookieStore);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized Access." },
      { status: 401 }
    );
  }

  const candidateId = params?.candidateId;
  if (!candidateId) {
    return NextResponse.json(
      { success: false, message: "Invalid candidate id." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", candidateId);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting candidate" },
      { status: 400 }
    );
  }

  await supabase.from("votes").delete().eq("candidate_id", candidateId);
  await supabase.from("votes").delete().eq("candidateId", candidateId);

  return NextResponse.json(
    { success: true, message: "Candidate Deleted Successfully" },
    { status: 200 }
  );
}
