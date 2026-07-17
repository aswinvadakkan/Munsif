import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdf";
import { z } from "zod";

// Request validation schema
const generatePdfRequestSchema = z.object({
  bodyContent: z.string().min(1, "Document content is required"),
  title: z.string().min(1, "Document title is required"),
  documentType: z.string().min(1, "Document type is required"),
  language: z.enum(["en", "hi"]).optional().default("en"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const raw = await request.json();
    const parsed = generatePdfRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { bodyContent, title, documentType, language } = parsed.data;

    // Generate the PDF
    const result = await generatePdf({
      bodyContent,
      title,
      documentType,
      language,
    });

    // Return the PDF as a download
    // Convert Buffer to Uint8Array for NextResponse BodyInit compatibility
    const pdfArray = new Uint8Array(result.buffer);
    return new NextResponse(pdfArray, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.fileName)}"`,
        "Content-Length": result.sizeBytes.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate PDF";

    return NextResponse.json(
      {
        error: "PDF generation failed",
        message,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight (in case the frontend
 * is on a different origin during development).
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
