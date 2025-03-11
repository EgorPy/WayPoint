# WayPoint

## Описание проекта

WayPoint — это клиент-серверный маркетплейс пассажирских перевозок, который позволяет выбирать города на карте, строить маршруты и бронировать билеты.

### Фронтенд:
- **React**
- **TypeScript**
- **REST API**
- **Адаптивный UI** (удобный, без ничего лишнего)

### Бекенд:
- **Чистая Java** (из скачиваемых библиотек — только SQLite)
- **REST API**
- **SQLite**
- **JSON**

### Архитектура проекта:
1. **Фронтенд (React)** → **REST API** → **Бекенд (Java)** → **БД (SQLite)**
2. Фронтенд и бекенд взаимодействуют через **application/x-www-form-urlencoded**
3. **Прокси** используется для удобного обращения фронтенда к бекенду, так как оба находятся в одной директории.

### Функции:
- **Яндекс Карта** для выбора города
- **Определение текущего местоположения** (города) по геолокации

## Данные

### Города:
Алмата, Бангкок, Берлин, Будапешт, Бухара, Буэнос-Айрес, Варшава, Вашингтон, Гонконг, Дортмунд, Дубай, Измир, Казань, Каир, Караганда, Лагос, Лондон, Лос-Анджелес, Майами, Мехико, Минск, Молоково, Москва, Мюнхен, Нью-Йорк, Осака, Париж, Пусан, Рим, Самарканд, Сан-Франциско, Санкт-Петербург, Сеул, Сингапур, Ташкент, Токио, Франкфурт-на-Майне.

### Алгоритм:
- **DFS-поиск** лучшего маршрута с учётом времени и типа транспорта
- Поддерживаются **пересадки** (максимальное число — 3)

## Запуск проекта

### Фронтенд

#### 1. Установка React:
```sh
npx create-react-app waypoint
```

#### 2. Установка Яндекс Карт:
```sh
npm install @pbe/react-yandex-maps
```

#### 3. Установка React Router:
```sh 
cd /waypoint
```
```sh
npm install react-router-dom --legacy-peer-deps
```

#### 4. Создание файла `config.json`:
Создать файл `config.json` в `C:\users\user\WayPoint\waypoint\src` с содержимым:
```json
{
    "YMAPS_KEY": "<ваш_ключ_Яндекс_Карт>",
    "BACKEND_PROXY_PORT": "<порт_бекенда>"
}
```
**Ключ для Яндекс.Карт** можно получить здесь: [Яндекс API](https://developer.tech.yandex.ru/services/3)  
(Выбрать **JavaScript API и HTTP Геокодер**)

#### 5. Запуск фронтенда:
```sh
cd C:\users\user\WayPoint\waypoint
npm start
```

#### 6. Проверка `setupProxy.js`
Если проект не запускается, убедитесь, что в `C:\users\user\WayPoint\waypoint\src` находится файл `setupProxy.js` с содержимым:

```js
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
```

### Бекенд

#### 1. Компиляция файлов:
```sh
javac -cp "sqlite-jdbc-3.42.0.0.jar;." Api.java Database.java Utils.java RouteFinder.java
```

#### 2. Запуск бекенда:
```sh
java -cp "sqlite-jdbc-3.42.0.0.jar;." Api
```

---

## Важно:

- **Фронтенд отправляет данные на бекенд с `Content-Type: application/x-www-form-urlencoded`**
- **Эндпоинты в запросах должны быть указаны как**:
  ```
  /api/hello
  ```
  а **не**:
  ```
  http://localhost:3000/api/hello
  https://localhost:3000/api/hello
  ```


# Запуск сайта через ngrok

1. Установите ngrok глобально:
   ```sh
   npm install -g ngrok
   ```

2. Запустите сайт по стандартной инструкции.

3. Откройте терминал и выполните команду:
   ```sh
   ngrok http 3000 --host-header=localhost
   ```

После выполнения команды в терминале появится публичный URL, который можно использовать для доступа к сайту извне, например с телефона

**Всё!**
