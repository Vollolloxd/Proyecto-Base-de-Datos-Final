# Imagen de la aplicacion web (API Node + React compilado)
# 1) Compilar el frontend (React + Tailwind)
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Backend que sirve la API y la app compilada
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
EXPOSE 3001
CMD ["node", "src/servidor.js"]
