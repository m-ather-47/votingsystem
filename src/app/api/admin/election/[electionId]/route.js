import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
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

  const electionId = params?.electionId;
  if (!electionId) {
    return NextResponse.json(
      { success: false, message: "Invalid election id." },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const { name, status } = payload || {};

  if (!name && !status) {
    return NextResponse.json(
      { success: false, message: "Nothing to update." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("elections")
    .update({ name, status })
    .eq("id", electionId)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: "Failed to update election." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Election updated successfully", data },
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

  const electionId = params?.electionId;
  if (!electionId) {
    return NextResponse.json(
      { success: false, message: "Invalid election id." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("elections")
    .delete()
    .eq("id", electionId);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete election." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Election deleted successfully" },
    { status: 200 }
  );
}
