import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

import { authenticateToken } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { count: adminCount, error: adminCountError } = await supabase
      .from("admins")
      .select("id", { count: "exact", head: true });

    if (adminCountError) {
      return NextResponse.json(
        { success: false, message: "Failed to read admins." },
        { status: 500 }
      );
    }

    if ((adminCount ?? 0) > 0) {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get("token");
      if (!tokenCookie?.value) {
        return NextResponse.json(
          { success: false, message: "Unauthorized Access." },
          { status: 401 }
        );
      }

      const userId = authenticateToken(cookieStore);
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized Access." },
          { status: 401 }
        );
      }
    }

    const { count: voterCount, error: voterCountError } = await supabase
      .from("voters")
      .select("id", { count: "exact", head: true });

    if (voterCountError) {
      return NextResponse.json(
        { success: false, message: "Failed to read voters." },
        { status: 500 }
      );
    }

    if ((voterCount ?? 0) === 0) {
      const { error: voterSeedError } = await supabase.from("voters").upsert(
        [
          {
            name: "Ali Raza",
            cnic: "3520212345671",
            dob: "2000-01-15",
            photo: "/profile.jpg",
            status: "Active",
          },
          {
            name: "Sara Khan",
            cnic: "3520276543219",
            dob: "2001-05-22",
            photo: "/profile.jpg",
            status: "Active",
          },
        ],
        { onConflict: "cnic" }
      );

      if (voterSeedError) {
        return NextResponse.json(
          { success: false, message: "Failed to seed voters." },
          { status: 500 }
        );
      }
    }

    const { error: voterPhotoError } = await supabase
      .from("voters")
      .update({ photo: "/profile.jpg" })
      .is("photo", null);

    if (voterPhotoError) {
      return NextResponse.json(
        { success: false, message: "Failed to update voter photos." },
        { status: 500 }
      );
    }

    const electionName = "University Student Council Election 2025";

    const { data: electionRow, error: electionReadError } = await supabase
      .from("elections")
      .select("id")
      .eq("name", electionName)
      .maybeSingle();

    if (electionReadError) {
      return NextResponse.json(
        { success: false, message: "Failed to read elections." },
        { status: 500 }
      );
    }

    let electionId = electionRow?.id || null;
    if (!electionId) {
      const { data: newElection, error: electionCreateError } = await supabase
        .from("elections")
        .insert({ name: electionName, status: "Active" })
        .select("id")
        .maybeSingle();

      if (electionCreateError || !newElection) {
        return NextResponse.json(
          { success: false, message: "Failed to create election." },
          { status: 500 }
        );
      }

      electionId = newElection.id;
    }

    const positionNames = ["President", "Vice President"];
    const { error: positionUpsertError } = await supabase
      .from("positions")
      .upsert(
        positionNames.map((name) => ({
          election_id: electionId,
          name,
        })),
        { onConflict: "election_id,name" }
      );

    if (positionUpsertError) {
      return NextResponse.json(
        { success: false, message: "Failed to seed positions." },
        { status: 500 }
      );
    }

    const { data: positionRows, error: positionReadError } = await supabase
      .from("positions")
      .select("id, name")
      .eq("election_id", electionId)
      .in("name", positionNames);

    if (positionReadError) {
      return NextResponse.json(
        { success: false, message: "Failed to read positions." },
        { status: 500 }
      );
    }

    const positionMap = new Map(
      (positionRows || []).map((row) => [row.name, row.id])
    );

    const candidatesSeed = [
      {
        name: "Ali Raza",
        party: "Unity Party",
        position: "President",
        photo: "/profile.jpg",
      },
      {
        name: "Sara Khan",
        party: "Progressive Front",
        position: "President",
        photo: "/profile.jpg",
      },
      {
        name: "Bilal Ahmed",
        party: "Unity Party",
        position: "Vice President",
        photo: "/profile.jpg",
      },
      {
        name: "Hira Noor",
        party: "Progressive Front",
        position: "Vice President",
        photo: "/profile.jpg",
      },
    ];

    const { data: existingCandidates, error: candidateReadError } =
      await supabase
        .from("candidates")
        .select("id, name, party, position")
        .in(
          "name",
          candidatesSeed.map((candidate) => candidate.name)
        );

    if (candidateReadError) {
      return NextResponse.json(
        { success: false, message: "Failed to read candidates." },
        { status: 500 }
      );
    }

    const existingKeys = new Set(
      (existingCandidates || []).map(
        (candidate) =>
          `${candidate.name}|${candidate.party}|${candidate.position}`
      )
    );

    const candidatesToInsert = candidatesSeed
      .filter(
        (candidate) =>
          !existingKeys.has(
            `${candidate.name}|${candidate.party}|${candidate.position}`
          )
      )
      .map((candidate) => ({
        ...candidate,
        election_id: electionId,
        position_id: positionMap.get(candidate.position) || null,
      }));

    if (candidatesToInsert.length > 0) {
      const { error: candidateSeedError } = await supabase
        .from("candidates")
        .insert(candidatesToInsert);

      if (candidateSeedError) {
        return NextResponse.json(
          { success: false, message: "Failed to seed candidates." },
          { status: 500 }
        );
      }
    }

    const { error: candidatePhotoError } = await supabase
      .from("candidates")
      .update({ photo: "/profile.jpg" })
      .is("photo", null);

    if (candidatePhotoError) {
      return NextResponse.json(
        { success: false, message: "Failed to update candidate photos." },
        { status: 500 }
      );
    }

    if ((adminCount ?? 0) === 0) {
      const adminHash = await bcrypt.hash("admin", 10);
      const { error: adminSeedError } = await supabase.from("admins").upsert(
        {
          username: "admin",
          password: adminHash,
        },
        { onConflict: "username" }
      );

      if (adminSeedError) {
        return NextResponse.json(
          { success: false, message: "Failed to seed admin." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Database seed applied." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database.",
      },
      { status: 500 }
    );
  }
}
