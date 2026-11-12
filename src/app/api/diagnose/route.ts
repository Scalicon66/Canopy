import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DiagnosisResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", plantName } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const base64Clean = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API key is configured, call Gemini
    if (apiKey && apiKey !== "your-gemini-api-key") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are Canopy's plant pathologist and botanical health specialist.
Analyze this leaf photograph carefully.
${plantName ? `The user identified this plant as: "${plantName}".` : "First identify the plant species from the leaf."}

Perform a thorough visual diagnostic check:
1. Identify the plant common name and scientific name.
2. Determine if the leaf is healthy or shows symptoms of distress (e.g. overwatering edema/chlorosis, underwatering necrosis, nutrient deficiencies like nitrogen/iron, fungal leaf spot, spider mites, thrips, scale, powdery mildew, or light sunburn).
3. Assign an overall severity rating: exactly one of "healthy", "needs_attention", or "critical".
4. Provide a friendly severityLabel:
   - if healthy: "Looking good"
   - if needs_attention: "Needs a look"
   - if critical: "Immediate attention"
5. Write a concise issue summary (e.g., "Leaf discoloration and mild margin browning").
6. Provide a warm, reassuring summary paragraph in Canopy's signature calm, supportive tone.
7. Provide diagnosis notes explaining likely causes.
8. Provide 3-4 specific, actionable care steps.
9. Suggest an optimal watering schedule and light recommendation.

Respond ONLY with a valid JSON object matching this schema:
{
  "plantName": string,
  "issue": string,
  "severity": "healthy" | "needs_attention" | "critical",
  "severityLabel": "Looking good" | "Needs a look" | "Immediate attention",
  "summary": string,
  "notes": string,
  "actionSteps": string[],
  "wateringSchedule": string,
  "lightRecommendation": string
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              inlineData: {
                mimeType,
                data: base64Clean,
              },
            },
            {
              text: prompt,
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "";
        const parsed: DiagnosisResult = JSON.parse(text);

        return NextResponse.json({
          ...parsed,
          isDemo: false,
        });
      } catch (geminiError) {
        console.warn("Gemini API call encountered an issue, falling back to simulated analysis:", geminiError);
        // Fall back to intelligent demo simulation so the UI does not break
      }
    }

    // Fallback / Demo Mode response when GEMINI_API_KEY is not yet configured or fails
    const mockDiagnosis: DiagnosisResult = {
      plantName: plantName || "Monstera Deliciosa",
      issue: "Leaf chlorosis & early margin browning",
      severity: "needs_attention",
      severityLabel: "Needs a look",
      summary:
        "The leaf displays early stages of chlorosis around the outer margins. The central vein remains resilient and healthy, suggesting this is a manageable watering or humidity adjustment.",
      notes:
        "Chlorosis with slight edge crisping is typically caused by a cycle of inconsistent soil moisture (drying out too quickly after soaking) or low ambient humidity.",
      actionSteps: [
        "Touch the top 2 inches of soil before watering. Water only when dry.",
        "Ensure pot drainage holes are free of standing water.",
        "Relocate away from air conditioning vents or direct afternoon sun.",
        "Gently wipe leaf surface with a damp cloth to boost photosynthesis."
      ],
      wateringSchedule: "Every 7-9 days after checking soil moisture",
      lightRecommendation: "Bright, indirect natural light (medium-high)",
      isDemo: true,
    };

    return NextResponse.json(mockDiagnosis);
  } catch (error) {
    console.error("Diagnosis error:", error);
    return NextResponse.json(
      { error: "Failed to complete plant diagnosis" },
      { status: 500 }
    );
  }
}
