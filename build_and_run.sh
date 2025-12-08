#!/bin/bash

echo "🚀 Building VerifDoc Docker images..."

docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

echo "⏳ Waiting for backend health check..."

# boucle jusqu'à ce que /health renvoie 200
for i in {1..30}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
    if [ "$STATUS" -eq 200 ]; then
        echo "✅ Backend is healthy!"
        break
    fi
    echo "… retry ($i/30)"
    sleep 2
done

if [ "$STATUS" -ne 200 ]; then
    echo "❌ Backend did not become healthy. Check logs."
    exit 1
fi

echo ""
echo "==========================================="
echo "     VerifDoc Platform Successfully Started"
echo "==========================================="
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo ""