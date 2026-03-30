import { Bomb } from "lucide-react";
import type { AppManifest } from "../_framework/types";

export const manifest: AppManifest = {
  id: "minesweeper",
  name: "Minesweeper",
  category: "system",
  defaultSize: { width: 380, height: 520 },
  noResize: true,
  singleton: true,
  icon: Bomb,
  image: "/page-icons/minesweeper.png",
  color: "#6366f1",
  labelKey: "minesweeper",
  order: 96,
  component: () => import("./pages"),
};
