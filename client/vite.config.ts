import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

let gitHash = 'nogit';
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  gitHash = 'nogit';
}

const buildTimestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const BUILD_VERSION = `${buildTimestamp}-${gitHash}`;

function versionEmitterPlugin(): Plugin {
  return {
    name: 'version-emitter-plugin',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            version: BUILD_VERSION,
            builtAt: new Date().toISOString(),
          },
          null,
          2
        ),
      });
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  plugins: [react(), versionEmitterPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
