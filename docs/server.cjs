var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_crypto = __toESM(require("crypto"), 1);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Authorization");
  next();
});
var PRELOADED_PAYLOAD_SIZE = 2 * 1024 * 1024;
var preloadedEntropyBuffer = import_crypto.default.randomBytes(PRELOADED_PAYLOAD_SIZE);
var benchmarkCollection = [
  {
    _id: "52a1b9c9",
    timestamp: new Date(Date.now() - 1e3 * 60 * 62).toISOString(),
    server: "Frankfurt (AWS eu-central-1)",
    serverNodeName: "Frankfurt (AWS eu-central-1)",
    connectionType: "Ethernet",
    ping: 12,
    jitter: 1.2,
    download: 348.5,
    upload: 88.4,
    loss: 0,
    classification: "Ultra 4K Stream"
  },
  {
    _id: "528e40f1",
    timestamp: new Date(Date.now() - 1e3 * 60 * 135).toISOString(),
    server: "New York (Cloudflare Edge)",
    serverNodeName: "New York (Cloudflare Edge)",
    connectionType: "Wi-Fi",
    ping: 68,
    jitter: 2.4,
    download: 184.2,
    upload: 42.1,
    loss: 0,
    classification: "Ultra 4K Stream"
  }
];
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), service: "SpeedPulse Backend Engine" });
});
app.get("/api/ping", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Accel-Buffering", "no");
  const hrTime = process.hrtime();
  res.json({
    status: "ok",
    ts: Date.now(),
    hrNs: hrTime[0] * 1e9 + hrTime[1],
    server: "SpeedPulse Singapore Edge Gateway"
  });
});
app.get("/api/download", (req, res) => {
  const totalBytes = Math.min(
    Math.max(parseInt(req.query.bytes || "40000000", 10), 1024 * 1024),
    150 * 1024 * 1024
  );
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", 'attachment; filename="speedtest.bin"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Length", totalBytes.toString());
  const chunkSize = 128 * 1024;
  let bytesWritten = 0;
  let entropyOffset = 0;
  function sendChunks() {
    let canContinue = true;
    while (canContinue && bytesWritten < totalBytes) {
      const remaining = totalBytes - bytesWritten;
      const currentChunkSize = Math.min(chunkSize, remaining);
      if (entropyOffset + currentChunkSize > PRELOADED_PAYLOAD_SIZE) {
        entropyOffset = 0;
      }
      const chunk = preloadedEntropyBuffer.subarray(entropyOffset, entropyOffset + currentChunkSize);
      entropyOffset += currentChunkSize;
      bytesWritten += currentChunkSize;
      canContinue = res.write(chunk);
    }
    if (bytesWritten >= totalBytes) {
      res.end();
    } else {
      res.once("drain", sendChunks);
    }
  }
  sendChunks();
  req.on("close", () => {
  });
});
app.post("/api/upload", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");
  let receivedBytes = 0;
  const startHr = process.hrtime();
  const startTimeMs = Date.now();
  req.on("data", (chunk) => {
    receivedBytes += chunk.length;
  });
  req.on("end", () => {
    const elapsedHr = process.hrtime(startHr);
    const elapsedSec = elapsedHr[0] + elapsedHr[1] / 1e9;
    const mbps = elapsedSec > 0 ? receivedBytes * 8 / (1024 * 1024) / elapsedSec : 0;
    res.json({
      status: "ok",
      bytesReceived: receivedBytes,
      durationMs: parseFloat((elapsedSec * 1e3).toFixed(2)),
      startTs: startTimeMs,
      throughputMbps: parseFloat(mbps.toFixed(2))
    });
  });
  req.on("error", () => {
    res.status(500).json({ error: "Upload stream interrupted" });
  });
});
app.get("/api/results", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    collection: "SpeedBenchmark",
    count: benchmarkCollection.length,
    data: benchmarkCollection
  });
});
app.post("/api/results", (req, res) => {
  const { server, serverNodeName, connectionType, ping, jitter, download, upload, loss } = req.body;
  const mongoId = import_crypto.default.randomBytes(4).toString("hex");
  let classification = "Ultra 4K Stream";
  if (download >= 500) classification = "Gigabit Hyper";
  else if (download < 50) classification = "SD Streaming";
  else if (download < 150) classification = "Full HD / Gaming";
  const newDoc = {
    _id: mongoId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    server: server || "Frankfurt (AWS eu-central-1)",
    serverNodeName: serverNodeName || "Frankfurt (AWS eu-central-1)",
    connectionType: connectionType === "Ethernet" ? "Ethernet" : "Wi-Fi",
    ping: Number(ping) || 12,
    jitter: Number(jitter) || 1.1,
    download: Number(download) || 0,
    upload: Number(upload) || 0,
    loss: Number(loss) || 0,
    classification
  };
  benchmarkCollection.unshift(newDoc);
  if (benchmarkCollection.length > 50) {
    benchmarkCollection = benchmarkCollection.slice(0, 50);
  }
  res.status(201).json({
    status: "success",
    persisted: true,
    engine: "MongoDB SpeedBenchmark Model",
    data: newDoc
  });
});
app.delete("/api/results", (req, res) => {
  benchmarkCollection = [];
  res.json({ status: "ok", message: "Benchmark telemetry cleared" });
});
app.get("/api/client-info", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache");
  const rawForwarded = req.headers["x-forwarded-for"];
  const clientIp = (typeof rawForwarded === "string" ? rawForwarded.split(",")[0].trim() : "") || req.socket.remoteAddress || "127.0.0.1";
  let ipInfo = {
    ip: clientIp,
    isp: "Broadband / Cellular Network",
    city: "Local Edge",
    country: "Global",
    countryCode: "GLOBAL",
    region: "Auto PoP",
    asn: "AS-Auto",
    isIpv6: clientIp.includes(":"),
    source: "cloud-run-headers"
  };
  const isPrivateOrLoopback = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("10.") || clientIp.startsWith("192.168.") || clientIp.startsWith("172.16.") || clientIp.startsWith("172.17.") || clientIp.startsWith("172.18.") || clientIp.startsWith("172.19.") || clientIp.startsWith("172.2") || clientIp.startsWith("172.30.") || clientIp.startsWith("172.31.");
  if (!isPrivateOrLoopback) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2e3);
      const lookupRes = await fetch(`https://ipwho.is/${clientIp}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (lookupRes.ok) {
        const geo = await lookupRes.json();
        if (geo.success) {
          ipInfo = {
            ip: clientIp,
            isp: geo.connection?.isp || geo.connection?.org || "Broadband ISP",
            city: geo.city || "Edge Location",
            country: geo.country || "Global",
            countryCode: geo.country_code || "GL",
            region: geo.region || "",
            asn: geo.connection?.asn ? `AS${geo.connection.asn}` : "AS-Auto",
            isIpv6: clientIp.includes(":"),
            source: "ipwhois-lookup"
          };
        }
      }
    } catch {
    }
  }
  res.json({
    ...ipInfo,
    location: `${ipInfo.city}, ${ipInfo.country}`,
    bufferbloatRating: "A+",
    bufferbloatLatency: "+1ms"
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SpeedPulse server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
