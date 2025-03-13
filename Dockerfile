FROM node:latest
WORKDIR /app
COPY . /app
RUN npx create-react-app waypoint
RUN cd waypoint && npm install @pbe/react-yandex-maps && npm install react-router-dom --legacy-peer-deps
WORKDIR /app/waypoint
CMD ["npm", "start"]
