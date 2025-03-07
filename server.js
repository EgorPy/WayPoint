import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5000;
const SUGGEST_API_KEY = "b1d01e5e-11d5-4dd7-93a0-87cdeef3e161";
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
