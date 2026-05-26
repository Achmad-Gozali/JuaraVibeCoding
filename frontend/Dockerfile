# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=https://xcljigqrbwtqkiuraohr.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGppZ3FyYnd0cWtpdXJhb2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzQwNDcsImV4cCI6MjA5MTYxMDA0N30.cuUyut7YhXzodpUSdGUvYQFWpU-wgXT8E_RM2fCHKsM
ENV NEXT_PUBLIC_SITE_URL=https://kawaltransaksi-605520424162.asia-southeast1.run.app
ENV NEXT_PUBLIC_API_URL=https://api.kawaltransaksi.com
ENV NEXT_PUBLIC_BACKEND_URL=https://api.kawaltransaksi.com
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfFLKQsAAAAAFW8V360k7lMm2thBq3HZt0ap_e1
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAC17ffJCQRIC8F0v
ENV NEXT_PUBLIC_SUPABASE_URL_ID=xcljigqrbwtqkiuraohr
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=665435739599-d0r8ag8a749vc5f1mqdicb5qof2ioada.apps.googleusercontent.com
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ✅ FIX: Copy client reference manifests untuk route groups
# Ini yang menyebabkan error 500 "clientReferenceManifest is not defined"
COPY --from=builder --chown=nextjs:nodejs /app/.next/server/app ./.next/server/app

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
