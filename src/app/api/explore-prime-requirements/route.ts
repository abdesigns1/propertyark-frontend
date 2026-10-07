import { readFile } from "node:fs/promises";
import path from "node:path";

const PDF_FILE_NAME = "PropertyArk-Photo-Video-Checklist.pdf";
const PDF_FILE_PATH = path.join(process.cwd(), "public", PDF_FILE_NAME);

export async function GET() {
  try {
    const pdf = await readFile(PDF_FILE_PATH);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${PDF_FILE_NAME}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Unable to serve the Explore Prime requirements PDF.", error);
    return Response.json(
      { message: "The requirements document is currently unavailable." },
      { status: 500 },
    );
  }
}
