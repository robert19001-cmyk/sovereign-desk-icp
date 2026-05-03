import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendCanisterId =
    process.env.CANISTER_ID_SOVEREIGN_DESK_BACKEND ||
    env.CANISTER_ID_SOVEREIGN_DESK_BACKEND ||
    "uzt4z-lp777-77774-qaabq-cai";

  return {
    root: resolve(__dirname),
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    define: {
      __BACKEND_CANISTER_ID__: JSON.stringify(backendCanisterId),
      __DFX_NETWORK__: JSON.stringify(process.env.DFX_NETWORK || env.DFX_NETWORK || "local"),
    },
  };
});
