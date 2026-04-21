export const runtime = "nodejs";

import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";

export async function POST(req: Request) {
  const data = await req.json();

  const tmpDir = "/tmp";

  await fs.writeFile(
    path.join(tmpDir, "data.json"),
    JSON.stringify(data)
  );

  const templatePath = path.join(process.cwd(), "data/arajanlat.typ");
  const template = await fs.readFile(templatePath, "utf-8");

  const inputPath = path.join(tmpDir, "arajanlat.typ");
  const outputPath = path.join(tmpDir, "out.pdf");

  await fs.writeFile(inputPath, template);

  await fs.copyFile(
    path.join(process.cwd(), "public/logo-text-color.svg"),
    path.join(tmpDir, "logo-text-color.svg")
  );

  await fs.copyFile(
    path.join(process.cwd(), "public/Vonalak.png"),
    path.join(tmpDir, "Vonalak.png")
  );

  const typstPath = path.join(process.cwd(), "bin/typst");

  await new Promise<void>((resolve, reject) => {
    execFile(
      typstPath,
      ["compile", inputPath, outputPath],
      {
        env: {
          ...process.env,
          HOME: "/tmp", // Vercel edge case fix
        },
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  const pdf = await fs.readFile(outputPath);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}