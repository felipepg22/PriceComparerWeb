FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM nginx:1.27-alpine AS final

ENV BACKEND_HOST=server \
    BACKEND_PORT=8080 \
    NGINX_ENVSUBST_FILTER=BACKEND_HOST|BACKEND_PORT

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080
