import { type AppRuntimeCtx, type Dispose, defineApp } from "@tokimo/sdk";
import { ConfigProvider, ToastProvider } from "@tokimo/ui";
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import MinesweeperPage from "./pages";
import "./index.css";

function MinesweeperWindow({ ctx }: { ctx: AppRuntimeCtx }) {
  return <MinesweeperPage ctx={ctx} />;
}

export default defineApp({
  id: "minesweeper",
  manifest: {
    id: "minesweeper",
    appName: "Minesweeper",
    icon: "Bomb",
    color: "#6366f1",
    windowType: "minesweeper",
    defaultSize: { width: 520, height: 620 },
    category: "app",
  },
  mount(container, ctx): Dispose {
    const root: Root = createRoot(container);
    root.render(
      <StrictMode>
        <ConfigProvider>
          <ToastProvider>
            <MinesweeperWindow ctx={ctx} />
          </ToastProvider>
        </ConfigProvider>
      </StrictMode>,
    );
    return () => root.unmount();
  },
});
