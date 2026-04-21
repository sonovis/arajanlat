export const runtime = "nodejs";

import fs from "fs/promises";
import path from "path";
import { InventoryItem } from "@/lib/types";

export async function loadInventory(): Promise<InventoryItem[]> {
  const filePath = path.join(process.cwd(), "data/inventory.tsv");
  const content = await fs.readFile(filePath, "utf-8");

  const lines = content.trim().split("\n");

  const [header, ...rows] = lines;

  return rows.map((line) => {
    const [id, name, price] = line.split("\t");

    return {
      id,
      name,
      price: Number(price),
    };
  });
}

export async function GET() {
  const data = await loadInventory();
  return Response.json(data);
}