#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🚀 Cloudflare Tunnel for Webhook Testing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Add cloudflared to PATH
export PATH="$HOME/bin:$PATH"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared not found!${NC}"
    echo "Installing cloudflared..."

    mkdir -p ~/bin
    cd ~/bin
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
    chmod +x cloudflared

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ cloudflared installed!${NC}\n"
    else
        echo -e "${RED}❌ Failed to install cloudflared${NC}"
        exit 1
    fi
fi

# Check if dev server is running on port 3000
if ! lsof -i:3000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Dev server not detected on port 3000${NC}"
    echo -e "Please make sure your dev server is running: ${BLUE}npm run dev${NC}\n"
fi

# Kill any existing cloudflared processes
pkill cloudflared 2>/dev/null

echo -e "${GREEN}🔄 Starting Cloudflare Tunnel...${NC}"
echo -e "${YELLOW}This will create a secure tunnel to localhost:3000${NC}\n"

# Start cloudflared tunnel
# Using quick tunnel mode (no login required for testing)
cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!

echo "Waiting for tunnel to initialize..."

# Wait up to 30 seconds for tunnel URL to appear
for i in {1..30}; do
    sleep 1
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)
    if [ ! -z "$TUNNEL_URL" ]; then
        break
    fi
    if [ $((i % 5)) -eq 0 ]; then
        echo "  Still waiting... ($i seconds)"
    fi
done

if [ -z "$TUNNEL_URL" ]; then
    echo -e "${RED}❌ Failed to get tunnel URL${NC}"
    echo "Checking logs..."
    tail -20 /tmp/cloudflared.log
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Tunnel started successfully!${NC}\n"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📡 Public URL: ${TUNNEL_URL}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Update .env.local
echo -e "${YELLOW}📝 Updating .env.local...${NC}"

cd /home/omar/Desktop/rayan2

if grep -q "NEXT_PUBLIC_APP_URL=" .env.local; then
    # Backup and update
    cp .env.local .env.local.backup
    sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${TUNNEL_URL}|" .env.local
    echo -e "${GREEN}✅ Updated NEXT_PUBLIC_APP_URL in .env.local${NC}"
else
    echo "NEXT_PUBLIC_APP_URL=${TUNNEL_URL}" >> .env.local
    echo -e "${GREEN}✅ Added NEXT_PUBLIC_APP_URL to .env.local${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 Tunnel is Ready!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}\n"
echo -e "1. ${GREEN}RESTART${NC} your dev server:"
echo -e "   ${BLUE}npm run dev${NC}\n"

echo -e "2. ${GREEN}TEST${NC} the webhook:"
echo -e "   - Make a payment with card: ${BLUE}4242424242424242${NC}"
echo -e "   - Expiry: ${BLUE}12/25${NC}, CVV: ${BLUE}123${NC}"
echo -e "   - Payment should auto-complete! ✨\n"

echo -e "3. ${GREEN}WEBHOOK URL:${NC}"
echo -e "   ${BLUE}${TUNNEL_URL}/api/thawani/webhook${NC}\n"

echo -e "4. ${GREEN}TEST WEBHOOK${NC} manually (optional):"
echo -e "   ${BLUE}curl ${TUNNEL_URL}/api/thawani/webhook${NC}\n"

echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo -e "   • Keep this terminal open while testing"
echo -e "   • URL stays the same as long as tunnel is running"
echo -e "   • Free and unlimited (no account required!)"
echo -e "   • More stable than ngrok\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Webhooks are now live!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Tunnel PID: $TUNNEL_PID"
echo "Logs: /tmp/cloudflared.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the tunnel${NC}\n"

# Keep tunnel running
trap "echo -e '\n${YELLOW}Stopping tunnel...${NC}'; kill $TUNNEL_PID 2>/dev/null; echo -e '${GREEN}Tunnel stopped${NC}'; exit" INT TERM

# Wait for the tunnel process
wait $TUNNEL_PID
