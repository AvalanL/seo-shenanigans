# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/marketing/package*.json ./apps/marketing/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:production

# Expose port
EXPOSE $PORT

# Change to marketing directory and start server
WORKDIR /app/apps/marketing
CMD ["npx", "serve", "dist", "-s", "-n", "-L", "-p", "$PORT"]
