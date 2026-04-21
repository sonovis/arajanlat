"use client";

import { useEffect, useState } from "react";
import type { InventoryItem } from "@/lib/types";

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setInventory);
  }, []);

  return inventory;
}