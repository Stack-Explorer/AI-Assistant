import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
    console.log("Request Hitted !")
  try {
    const body = await req.json();
    const { text } = body;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [{ text }],
          },
        ],
      }
    );

    const data = res.data; 

    return NextResponse.json({
      answer: data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer",
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to generate answer" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}