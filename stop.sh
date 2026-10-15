#!/bin/bash

echo "🛑 Stopping Mavi Agro..."

pkill -f "next-server"
pkill -f "next-router-worker"
pkill -f "agro"
killall node 2>/dev/null
killall cloudflared 2>/dev/null

echo "✅ All servers stopped. Have a nice day!"
