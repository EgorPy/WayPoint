const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const configPath = path.resolve(__dirname, "config.json");
const rawData = fs.readFileSync(configPath, "utf-8");
const config = JSON.parse(rawData);
const host = `http://localhost:${config.BACKEND_PROXY_PORT}`;

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: host,
            changeOrigin: true,
            cookieDomainRewrite: ""
        })
    );
};
