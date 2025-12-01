#!/bin/sh
set -e

echo "🔄 Starting OrderX application..."

# ⛔ NO NEED TO WAIT FOR LOCAL MONGODB
echo "⏳ Using MongoDB Atlas — skipping DB wait"

# Prisma sync
echo "🗄️ Running Prisma migrations..."
npx prisma db push --accept-data-loss || echo "⚠️ Prisma push failed, continuing..."

echo "🚀 Starting Node.js server..."
exec node dist/app.js
