import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env": env,
    },
    plugins: [react(), viteTsconfigPaths()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
  };
});
