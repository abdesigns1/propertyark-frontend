import { readFile } from "node:fs/promises";
import path from "node:path";

const WORKER_FILE_PATH = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);

export async function GET() {
  try {
    const worker = await readFile(WORKER_FILE_PATH);

    return new Response(new Uint8Array(worker), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "text/javascript; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Unable to serve the PDF preview worker.", error);
    return new Response("PDF preview worker unavailable.", { status: 500 });
  }
}
