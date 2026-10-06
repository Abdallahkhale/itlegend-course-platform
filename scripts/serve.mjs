import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".pdf": "application/pdf", ".mp4": "video/mp4", ".vtt": "text/vtt; charset=utf-8" };

if (!existsSync(root)) throw new Error("Production output is missing. Run npm run build first.");

createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); } catch { response.writeHead(400).end(); return; }
  let file = resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${sep}`)) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  if (!existsSync(file)) { response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }); createReadStream(resolve(root, "404.html")).pipe(response); return; }
  const size = statSync(file).size;
  const type = mime[extname(file)] || "application/octet-stream";
  const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": pathname.startsWith("/_next/") ? "public, max-age=31536000, immutable" : "public, max-age=0" };
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
    if (start > end || start >= size) { response.writeHead(416, { "Content-Range": `bytes */${size}` }).end(); return; }
    response.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    createReadStream(file, { start, end }).pipe(response);
  } else {
    response.writeHead(200, { ...headers, "Content-Length": size });
    if (request.method === "HEAD") response.end(); else createReadStream(file).pipe(response);
  }
}).listen(port, "127.0.0.1", () => process.stdout.write(`Production course platform: http://127.0.0.1:${port}\n`));
