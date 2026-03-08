import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/safety-vote/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("@radix-ui")) return "ui-vendor";
            if (id.includes("react-hook-form") || id.includes("zod")) return "form-vendor";
            if (id.includes("sonner")) return "toast-vendor";
            return "vendor";
          }

          // Feature chunks
          if (id.includes("src/components/auth") || id.includes("src/hooks/useAuth")) return "auth";
          if (id.includes("src/components/voting") || id.includes("src/components/results")) return "voting";
          if (id.includes("src/components/admin") || id.includes("src/pages/admin")) return "admin";
          if (id.includes("src/lib/audit") || id.includes("src/components/audit")) return "audit";
        },
      },
    },
  },
}));
