import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API Error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to create session", message: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("OpenAI Session Response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 }
    );
  }
}
