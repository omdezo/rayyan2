#!/bin/bash

# Simple manual tunnel starter
export PATH="$HOME/bin:$PATH"

echo "🚀 Starting Cloudflare Tunnel..."
echo "Keep this terminal open!"
echo ""

# Kill any existing tunnels
pkill cloudflared 2>/dev/null

# Start tunnel (this will show URL in output)
cloudflared tunnel --url http://localhost:3000
