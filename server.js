import { readFile } from "fs/promises";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";

const app = express();
const data = await readFile("./src/config.json", "utf-8");
const config = JSON.parse(data);

const PORT = config.YMAPS_PROXY_PORT;
const SUGGEST_API_KEY = config.YMAPS_SUGGEST_KEY;
const SUGGEST_URL = "https://suggest-maps.yandex.ru/v1/suggest";

app.use(cors());

app.get("/api/suggest", async (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: "Требуется параметр text" });

  try {
    const response = await fetch(
      `${SUGGEST_URL}?apikey=${SUGGEST_API_KEY}&text=${encodeURIComponent(text)}&lang=ru_RU`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Ошибка запроса к Yandex API" });
  }
});

app.listen(PORT, () => console.log(`Proxy сервер запущен на http://localhost:${PORT}`));
