#!/bin/bash
set -e

echo "Building Docker images for backend and frontend..."
docker compose build

echo "Starting Docker Compose services in detached mode..."
docker compose up -d

echo "Waiting for backend service to become healthy..."
BACKEND_HEALTH_URL="http://localhost:8000/health"
MAX_RETRIES=30
RETRY_INTERVAL=5
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_HEALTH_URL || echo "000")
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "Backend is healthy! (Status: $HTTP_CODE)"
    break
  else
    echo "Backend not yet healthy (status: $HTTP_CODE). Retrying in $RETRY_INTERVAL seconds... (Attempt $((ATTEMPT+1))/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
    ATTEMPT=$((ATTEMPT+1))
  fi
done

if [ $ATTEMPT -eq $MAX_RETRIES ]; then
  echo "Error: Backend did not become healthy within the allotted time."
  echo "Please check the Docker Compose logs for 'verifdoc-backend' service."
  exit 1
fi

echo ""
echo "========================================"
echo " VerifDoc services are up and running! "
echo "========================================"
echo "Frontend URL: http://localhost:80"
echo "Backend API URL: http://localhost:8000"
echo "========================================"
echo ""