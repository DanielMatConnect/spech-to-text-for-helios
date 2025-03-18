# Build stage
FROM node:20-alpine as builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy setup script and package files first
COPY setup.sh package*.json ./

# Make setup script executable and ensure proper line endings
RUN chmod +x setup.sh && \
    dos2unix setup.sh 2>/dev/null || true

# Run setup script to install dependencies and download whisper model
RUN /bin/sh setup.sh

# Copy remaining source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and whisper model from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.cache/whisper /app/.cache/whisper

# Create directory for temporary audio files
RUN mkdir -p /app/uploads

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV WHISPER_NO_CUDA=true
ENV WHISPER_CACHE_DIR=/app/.cache/whisper

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
