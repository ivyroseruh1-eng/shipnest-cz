import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    {
      name: "spa-fallback-200",
      closeBundle() {
        const distIndex = path.resolve(__dirname, "dist/index.html");
        const dist200 = path.resolve(__dirname, "dist/200.html");
        if (fs.existsSync(distIndex)) {
          fs.copyFileSync(distIndex, dist200);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("luxuryProducts")) {
            return "luxury-catalogue";
          }
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor";
            }
            if (id.includes("@tanstack")) {
              return "query";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("@radix-ui")) {
              return "ui";
            }
            if (id.includes("@supabase")) {
              return "supabase";
            }
          }
        },
      },
    },
  },
});
