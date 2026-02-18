import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/playgrounds": path.resolve(__dirname, "./src/playgrounds"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Monaco Editor en chunk separado (lazy loaded)
          if (id.includes("@monaco-editor/react")) {
            return "monaco";
          }
          // React Router en chunk separado
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          // Vendor libraries pesadas (React core)
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "vendor";
          }
        },
      },
    },
  },
});
