# Stage 1: Build the Vite + React TypeScript App
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
