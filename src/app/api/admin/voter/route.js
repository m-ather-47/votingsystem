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

  const { data, error } = await supabase.from("voters").select();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch voters." },
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
  const { name, cnic, dob, status, photo } = payload || {};

  if (!name || !cnic || !dob) {
    return NextResponse.json(
      { success: false, message: "Please provide all voter details." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("voters")
    .insert({ name, cnic, dob, status: status || "Not Voted", photo: photo || null })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Error creating voter." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Voter created successfully", data },
    { status: 200 }
  );
}
