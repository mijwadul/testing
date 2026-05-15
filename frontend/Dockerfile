# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Tambahkan ARG agar variabel VITE bisa terbaca saat build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
# Vite akan gagal jika ada error kecil di kode, pastikan log di atas error dibaca
RUN npm run build

# Stage 2: Serve dengan Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
