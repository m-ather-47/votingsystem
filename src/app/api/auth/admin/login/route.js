"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { createClient } from "@/utils/supabase/server";
import { generateToken } from "@/lib/utils";

export async function POST(req) {
  const formData = await req.json();
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data, error } = await supabase
    .from("admins")
    .select()
    .match({ username: formData.username })
    .maybeSingle();

  const isPasswordCorrect = bcrypt.compareSync(
    formData.password,
    data?.password || ""
  );

  if (error) {
    return NextResponse.json(
      { success: false, message: "Please enter all credentials" },
      { status: 400 }
    );
  }

  if (!data || !isPasswordCorrect) {
    return NextResponse.json(
      { success: false, message: "Username or Password is Incorrect" },
      { status: 400 }
    );
  }

  generateToken(data.username, cookieStore);
  return NextResponse.json(
    { success: true, message: "Logged in Successfully" },
    { status: 200 }
  );
}
