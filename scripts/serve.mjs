import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { createBrotliCompress, createGzip, constants } from "node:zlib";

const root = resolve("out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".pdf": "application/pdf", ".mp4": "video/mp4", ".vtt": "text/vtt; charset=utf-8" };

if (!existsSync(root)) throw new Error("Production output is missing. Run npm run build first.");

function preferredEncoding(header = "") {
  const accepted = header.split(",").map((part) => {
    const [name, ...parameters] = part.trim().split(";");
    const quality = parameters.find((value) => value.trim().startsWith("q="));
    return { name: name.trim(), quality: quality ? Number(quality.trim().slice(2)) : 1 };
  });
  return ["br", "gzip"].map((name) => ({ name, quality: accepted.find((item) => item.name === name)?.quality ?? accepted.find((item) => item.name === "*")?.quality ?? 0 })).filter((item) => item.quality > 0).sort((a, b) => b.quality - a.quality)[0]?.name;
}

createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405, { Allow: "GET, HEAD" }).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); } catch { response.writeHead(400).end(); return; }
  if (basePath && pathname === basePath) { response.writeHead(301, { Location: `${basePath}/` }).end(); return; }
  const inBasePath = !basePath || pathname.startsWith(`${basePath}/`);
  if (inBasePath && basePath) pathname = pathname.slice(basePath.length);
  let file = resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${sep}`)) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  const status = inBasePath && existsSync(file) ? 200 : 404;
  if (status === 404) file = resolve(root, "404.html");
  const size = statSync(file).size;
  const type = mime[extname(file)] || "application/octet-stream";
  const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": pathname.startsWith("/_next/") ? "public, max-age=31536000, immutable" : "public, max-age=0" };
  const range = status === 200 && request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
    if (start > end || start >= size) { response.writeHead(416, { "Content-Range": `bytes */${size}` }).end(); return; }
    response.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    if (request.method === "HEAD") response.end(); else createReadStream(file, { start, end }).pipe(response);
  } else {
    const compressible = /^(text\/|application\/json|image\/svg\+xml)/.test(type);
    const encoding = compressible ? preferredEncoding(request.headers["accept-encoding"]) : undefined;
    const delivery = encoding ? { "Content-Encoding": encoding } : { "Content-Length": size };
    response.writeHead(status, { ...headers, ...(compressible ? { Vary: "Accept-Encoding" } : {}), ...delivery });
    if (request.method === "HEAD") { response.end(); return; }
    const stream = createReadStream(file);
    if (encoding) stream.pipe(encoding === "br" ? createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }) : createGzip()).pipe(response);
    else stream.pipe(response);
  }
}).listen(port, "127.0.0.1", () => process.stdout.write(`Production course platform: http://127.0.0.1:${port}${basePath}/\n`));
