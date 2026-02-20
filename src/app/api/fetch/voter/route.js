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
      {
        success: false,
        message: "Unauthorized Access.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("voters")
    .select()
    .match({ cnic: userId })
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 400 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { success: false, message: "Voter not found." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: data });
}
