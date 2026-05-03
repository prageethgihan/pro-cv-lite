import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // ✅ Reduce COOP warnings in dev (Firebase/Auth popups etc.)
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  optimizeDeps: {
    // @imgly/background-removal uses dynamic WASM + ONNX fetches at runtime
    exclude: ["@imgly/background-removal"],
  },
});