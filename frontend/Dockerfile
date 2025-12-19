# Stage 1: Development & Build
FROM node:20-alpine AS development
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
# This stage now has node and npm available
EXPOSE 5173

# Stage 2: Production Build (Selective)
FROM development AS build
RUN npm run build

# Stage 3: Production Serve
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]