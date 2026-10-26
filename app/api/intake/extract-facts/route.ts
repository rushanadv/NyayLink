import { NextRequest, NextResponse } from "next/server";
import { extractFactsFromText } from "@/lib/intake/fact-extractor";
import { IntakeFacts } from "@/lib/intake/fact-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      state,
      topic,
      userRole,
      desiredOutcome,
      action,
      confirmedFacts,
    } = body;

    // Handle "confirm" action
    if (action === "confirm" && confirmedFacts) {
      const updated: IntakeFacts = {
        ...confirmedFacts,
        hasConfirmed: true,
        confirmedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, facts: updated });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required to extract structured legal facts." },
        { status: 400 }
      );
    }

    const facts = extractFactsFromText(
      text,
      state,
      topic,
      userRole,
      desiredOutcome
    );

    return NextResponse.json({ success: true, facts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fact extraction failed";
    console.error("[Extract Facts API] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
