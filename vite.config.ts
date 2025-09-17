import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: mode === "production" ? "/Daily-Budget/" : "/",
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    define: {
      __DEV__: mode === 'development',
    },
    // Explicitly specify environment file loading
    envPrefix: 'VITE_',
    envDir: process.cwd(),
  }
})
