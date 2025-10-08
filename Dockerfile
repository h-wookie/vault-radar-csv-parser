# --- Stage 1: Build the React app ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your hardened nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean up directives from the base config that conflict
RUN sed -i '/user\s\+nginx;/d' /etc/nginx/nginx.conf && \
    sed -i '/pid\s\+/d' /etc/nginx/nginx.conf && \
    mkdir -p /var/cache/nginx /run /var/log/nginx && \
    chown -R nginx:nginx /usr/share/nginx /var/cache/nginx /run /var/log/nginx

USER nginx

EXPOSE 8080

# Start nginx with custom PID path to avoid root-only directories
CMD ["sh", "-c", "nginx -g 'pid /tmp/nginx.pid; daemon off;'"]