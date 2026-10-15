#!/bin/bash

# Clear old logs
rm -f tunnel.log

echo "🌱 Starting Mavi Agro Server..."

# 1. Start Next.js App (Background)
npm run dev > server.log 2>&1 &
APP_PID=$!
echo "✅ App started (PID: $APP_PID)"

# 2. Wait for App to be truly ready (TCP check)
echo "⏳ Waiting for server to wake up..."
while ! nc -z 127.0.0.1 3001; do   
  sleep 1
done
echo "✅ Server is accepting connections!"

# 3. Start Cloudflare Tunnel (Using 127.0.0.1 to avoid IPv6 issues)
echo "☁️  Opening Public Tunnel..."
cloudflared tunnel --url http://127.0.0.1:3001 > tunnel.log 2>&1 &
TUNNEL_PID=$!

# 4. Robust Wait for URL
echo "⏳ Waiting for public link..."

attempts=0
max_attempts=40

while [ $attempts -lt $max_attempts ]; do
    if grep -q "trycloudflare.com" tunnel.log; then
        URL=$(grep -o 'https://[^"]*\.trycloudflare\.com' tunnel.log | head -n 1)
        
        if [ ! -z "$URL" ]; then
             echo ""
             echo "=================================================="
             echo "🚀 SERVER IS LIVE!"
             echo "🌍 Public Link: $URL"
             echo "🏠 Local Link:  http://localhost:3001"
             echo "=================================================="
             echo ""
             echo "Type './stop.sh' to shut everything down."
             exit 0
        fi
    fi
    
    sleep 1
    attempts=$((attempts+1))
    echo -n "."
done

echo ""
echo "❌ Timed out waiting for URL."
echo "Diagnostic: Here is the end of tunnel.log:"
tail -n 5 tunnel.log
