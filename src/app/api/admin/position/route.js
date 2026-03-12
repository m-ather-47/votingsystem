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
      { success: true, message: "Position created successfully" },
      { status: 200 }
    );
  }

  const payload = await req.json();
  const { electionId, name } = payload || {};

  if (!electionId || !name) {
    return NextResponse.json(
      { success: false, message: "Please provide election and position name." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("positions")
    .insert({ election_id: electionId, name })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create position." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Position created successfully", data },
    { status: 200 }
  );
}
