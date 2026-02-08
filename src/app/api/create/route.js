import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
export async function GET() {
  const user = bcrypt.hashSync("admin", 10);
  console.log(user);
  return NextResponse.json({ success: true, message: user });
}
