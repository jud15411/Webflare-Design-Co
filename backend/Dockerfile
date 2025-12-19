# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app
# Only copy necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/src ./src
# Install only production dependencies
RUN npm install --only=production
EXPOSE 5000
CMD ["node", "src/index.js"]