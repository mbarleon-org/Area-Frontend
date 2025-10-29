import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  publicDir: "./assets",
  server: {
    proxy: {
      "/api": {
        target: "https://area.mbarleon.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
