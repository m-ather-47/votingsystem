"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/neon/server";
import { generateToken } from "@/lib/utils";

export async function POST(req) {
  const formData = await req.json();
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data, error } = await supabase
    .from("voters")
    .select()
    .match({ cnic: formData.cnic, dob: formData.dob })
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Please enter all credentials" },
      { status: 400 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, message: "You are not a registered voter" },
      { status: 400 }
    );
  }

  // revalidatePath("/", "layout");
  generateToken(data.cnic, cookieStore);
  return NextResponse.json(
    { success: true, message: "Logged in Successfully" },
    { status: 200 }
  );
}
