import { defineConfig, type PluginOption } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Works around a Node http behavior: when `res.setHeader(...)` has been called
 * before `res.writeHead(status, text, [k, v, k, v, ...])`, each entry in the
 * array overwrites prior values for the same key — so multiple `Set-Cookie`
 * entries collapse to the last one. srvx's `sendNodeResponse` uses exactly
 * that flat-array form, and Vite's connect chain pre-sets headers, so we
 * lose all but the last Set-Cookie on the wire.
 *
 * This middleware wraps `res.writeHead` to extract any Set-Cookie entries
 * from the array, call `res.appendHeader('set-cookie', value)` for each
 * (which accumulates), then call the original writeHead with the rest.
 */
function fixMultiSetCookieDev(): PluginOption {
  return {
    name: "fix-multi-set-cookie-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        const originalWriteHead = res.writeHead.bind(res);
        // @ts-expect-error — overwriting writeHead at runtime is intentional
        res.writeHead = function (
          status: number,
          statusOrHeaders?: string | any[] | Record<string, any>,
          maybeHeaders?: any[] | Record<string, any>,
        ): any {
          let statusText: string | undefined;
          let headers: any[] | Record<string, any> | undefined;
          if (typeof statusOrHeaders === "string") {
            statusText = statusOrHeaders;
            headers = maybeHeaders;
          } else {
            headers = statusOrHeaders;
          }

          if (Array.isArray(headers)) {
            const remaining: string[] = [];
            for (let i = 0; i < headers.length; i += 2) {
              const k = headers[i];
              const v = headers[i + 1];
              if (typeof k === "string" && k.toLowerCase() === "set-cookie") {
                res.appendHeader("set-cookie", v as string);
              } else {
                remaining.push(k, v as string);
              }
            }
            if (statusText !== undefined) return originalWriteHead(status, statusText, remaining);
            return originalWriteHead(status, remaining);
          }

          if (statusText !== undefined) return originalWriteHead(status, statusText, headers as any);
          return originalWriteHead(status, headers as any);
        };
        next();
      });
    },
  };
}

const config = defineConfig({
  plugins: [
    devtools(),
    fixMultiSetCookieDev(),
    nitro(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
