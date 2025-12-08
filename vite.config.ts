import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import * as esbuild from 'esbuild';

function transformNodeModulesJsx() {
  const match = /node_modules.*(@expo\/vector-icons|react-native-vector-icons)\/.*\\.js$/;
  return {
    name: 'transform-node-modules-jsx',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      try {
        if (match.test(id)) {
          const res = await esbuild.transform(code, { loader: 'jsx', jsx: 'automatic', target: 'es2019' });
          return { code: res.code, map: res.map };
        }
      } catch (e) {
        throw e;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [transformNodeModulesJsx(), react()],
  root: "./src",
  publicDir: "../assets",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
      'react-native': path.resolve(__dirname, 'src/shims/react-native.ts'),
      '@expo/vector-icons': path.resolve(__dirname, 'src/shims/expo-vector-icons.tsx'),
    },
  },
  optimizeDeps: {
    include: ['react-native-web'],
    exclude: ['react-native', '@expo/vector-icons'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
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
