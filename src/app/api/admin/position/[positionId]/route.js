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

  const positionId = params?.positionId;
  if (!positionId) {
    return NextResponse.json(
      { success: false, message: "Invalid position id." },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const { name } = payload || {};

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Nothing to update." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("positions")
    .update({ name })
    .eq("id", positionId)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: "Failed to update position." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Position updated successfully", data },
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

  const positionId = params?.positionId;
  if (!positionId) {
    return NextResponse.json(
      { success: false, message: "Invalid position id." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("id", positionId);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete position." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Position deleted successfully" },
    { status: 200 }
  );
}
