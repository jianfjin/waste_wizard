# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install && npm cache clean --force

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy static game files
COPY shootwaste.html /usr/share/nginx/html/
COPY images_selected /usr/share/nginx/html/images_selected

# Copy JSON data files
COPY all_wastes.json /usr/share/nginx/html/
COPY all_wastes_en.json /usr/share/nginx/html/

# Copy audio files (specific files we know exist)
COPY game-music-loop-3-144252.mp3 /usr/share/nginx/html/
COPY short-game-music-loop-38898.mp3 /usr/share/nginx/html/

# Create a non-root user and set up permissions
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    mkdir -p /tmp && \
    chmod 777 /tmp

# Switch to non-root user
USER appuser

# Expose port 8080 (Google Cloud Run default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
