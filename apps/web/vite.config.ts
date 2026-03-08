import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: {
      // 告诉 Vite：只要是发往 /api 的请求，全部转发给 3000 端口
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
