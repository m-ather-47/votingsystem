import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
import { authenticateToken, isDemoUser, DEMO_VOTERS } from "@/lib/utils";

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

  if (isDemoUser(userId)) {
    return NextResponse.json(
      { success: true, message: "Voter updated successfully" },
      { status: 200 }
    );
  }

  const { voterId } = await params;
  if (!voterId) {
    return NextResponse.json(
      { success: false, message: "Invalid voter id." },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const { name, cnic, dob, status, photo } = payload || {};

  const updates = {
    ...(name ? { name } : {}),
    ...(cnic ? { cnic } : {}),
    ...(dob ? { dob } : {}),
    ...(status ? { status } : {}),
    ...(photo !== undefined ? { photo: photo || null } : {}),
  };

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, message: "Nothing to update." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("voters")
    .update(updates)
    .eq("id", voterId)
    .select()
    .maybeSingle();

  if (!error && data) {
    return NextResponse.json(
      { success: true, message: "Voter updated successfully", data },
      { status: 200 }
    );
  }

  const fallback = await supabase
    .from("voters")
    .update(updates)
    .eq("cnic", voterId)
    .select()
    .maybeSingle();

  if (fallback.error || !fallback.data) {
    return NextResponse.json(
      { success: false, message: "Voter not found." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Voter updated successfully", data: fallback.data },
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

  if (isDemoUser(userId)) {
    return NextResponse.json(
      { success: true, message: "Voter Deleted Successfully" },
      { status: 200 }
    );
  }

  const { voterId } = await params;
  if (!voterId) {
    return NextResponse.json(
      { success: false, message: "Invalid voter id." },
      { status: 400 }
    );
  }

  if (DEMO_VOTERS.includes(voterId)) {
    return NextResponse.json(
      { success: false, message: "Test voters cannot be deleted." },
      { status: 400 }
    );
  }

  let { data, error } = await supabase
    .from("voters")
    .delete()
    .eq("id", voterId)
    .select();

  if (!error && data && data.length > 0) {
    return NextResponse.json(
      { success: true, message: "Voter Deleted Successfully" },
      { status: 200 }
    );
  }

  const fallback = await supabase
    .from("voters")
    .delete()
    .eq("cnic", voterId)
    .select();

  if (fallback.error || !fallback.data || fallback.data.length === 0) {
    return NextResponse.json(
      { success: false, message: "Voter not found." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Voter Deleted Successfully" },
    { status: 200 }
  );
}
