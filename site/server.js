/**
 * HTTPS dev server for local debugging (e.g. geolocation from phone).
 * Generates a self-signed cert valid for localhost and your LAN IP.
 * Run: npm run dev:https
 * Then open https://localhost:3000 or https://<your-ip>:3000 (accept the browser cert warning once).
 */

const https = require("https");
const next = require("next");
const os = require("os");
const selfsigned = require("selfsigned");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const attrs = [{ name: "commonName", value: "localhost" }];
const ips = ["127.0.0.1", "0.0.0.0"];
const localIP = getLocalIP();
if (localIP) ips.push(localIP);
const options = {
  keySize: 2048,
  days: 365,
  algorithm: "sha256",
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        ...ips.map((ip) => ({ type: 7, ip })),
      ],
    },
  ],
};

const pems = selfsigned.generate(attrs, options);
const httpsOptions = {
  key: pems.private,
  cert: pems.cert,
};

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = https.createServer(httpsOptions, (req, res) => handle(req, res));
  server.listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
    if (localIP) {
      console.log(`> Also: https://${localIP}:${port} (for phone/other devices – accept the cert warning once)`);
    }
  });
});
