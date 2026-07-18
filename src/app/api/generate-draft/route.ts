import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateLegalDocument, isConfigured } from "@/lib/llm";
import { getTemplateById } from "@/lib/document-templates";
import { generateDocumentPreview } from "@/lib/document-previews";

const generateDraftRequestSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  formData: z.record(z.string(), z.string()),
  language: z.enum(["en", "hi"]).optional().default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = generateDraftRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { documentType, formData, language } = parsed.data;

    // Validate that the document type exists
    const template = getTemplateById(documentType);
    if (!template) {
      return NextResponse.json(
        {
          error: "Unknown document type",
          message: `Document type "${documentType}" is not recognized.`,
        },
        { status: 400 }
      );
    }

    // Try LLM generation if configured
    if (isConfigured()) {
      try {
        const result = await generateLegalDocument({
          documentType: template.name,
          formData,
          language,
        });

        return NextResponse.json({
          content: result.content,
          tokens: result.tokens,
          method: "llm" as const,
        });
      } catch (err) {
        console.error("LLM generation failed, falling back to template:", err);
        // Fall through to template-based generation
      }
    }

    // Fallback: template-based generation
    const templateContent = generateDocumentPreview(template, formData);

    // Since template previews are HTML, extract plain text for the response
    // Strip HTML tags for plain text output while preserving structure
    const plainText = templateContent
      .replace(/<h1[^>]*>/g, "\n\n")
      .replace(/<h2[^>]*>/g, "\n\n")
      .replace(/<\/h[12]>/g, "\n")
      .replace(/<p[^>]*>/g, "\n")
      .replace(/<\/p>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<div[^>]*>/g, "\n")
      .replace(/<\/div>/g, "\n")
      .replace(/<table[^>]*>/g, "\n")
      .replace(/<\/table>/g, "\n")
      .replace(/<tr[^>]*>/g, "\n")
      .replace(/<\/tr>/g, "")
      .replace(/<t[hd][^>]*>/g, "  ")
      .replace(/<\/t[hd]>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      content: plainText,
      tokens: 0,
      method: "template" as const,
    });
  } catch (error) {
    console.error("generate-draft error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate document";

    return NextResponse.json(
      {
        error: "Document generation failed",
        message,
      },
      { status: 500 }
    );
  }
}

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
