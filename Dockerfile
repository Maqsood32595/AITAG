# -------------------------------------------------------------
# Stage 1: Build Vite React Frontend
# -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies including devDependencies (vite, typescript)
RUN cd client && npm ci

# Copy client source code
COPY client/ ./client

# Build frontend to client/dist
RUN cd client && npm run build

# -------------------------------------------------------------
# Stage 2: Minimal Production Server Runner
# -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server backend
COPY server/ ./server

# Copy built frontend directly to server/public
COPY --from=builder /app/client/dist ./server/public

EXPOSE 8080

CMD ["node", "server/index.js"]
