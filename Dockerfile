# Build stage (example for Vite)
FROM node:alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use a placeholder in your build config or code, then build
RUN npm run build:prod

# Production stage
FROM nginx:stable-alpine AS production-stage
# Install envsubst (required for the script)
RUN apk add --no-cache gettext

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY entrypoint.sh /docker-entrypoint.d/entrypoint.sh
# Make the script executable
RUN chmod +x /docker-entrypoint.d/entrypoint.sh

# The base Nginx image automatically runs scripts in /docker-entrypoint.d/
# If using a different base image, you would use CMD ["/entrypoint.sh"]

COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]