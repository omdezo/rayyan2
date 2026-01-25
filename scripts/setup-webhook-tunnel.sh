#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Webhook Tunnel Setup Script${NC}\n"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok not found!${NC}"
    echo "Installing ngrok..."
    npm install -g ngrok
fi

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok is not authenticated${NC}\n"
    echo "Please follow these steps:"
    echo "1. Go to: https://dashboard.ngrok.com/signup"
    echo "2. Create a free account"
    echo "3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    read -p "Enter your ngrok authtoken: " authtoken

    if [ -z "$authtoken" ]; then
        echo -e "${RED}❌ No authtoken provided. Exiting.${NC}"
        exit 1
    fi

    ngrok config add-authtoken "$authtoken"
    echo -e "${GREEN}✅ ngrok authenticated!${NC}\n"
fi

# Check if dev server is running on port 3000
if ! lsof -i:3000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Dev server not running on port 3000${NC}"
    echo "Please start your dev server first: npm run dev"
    echo ""
    read -p "Press Enter when dev server is running..."
fi

# Kill existing ngrok processes
pkill ngrok 2>/dev/null

echo -e "${GREEN}🔄 Starting ngrok tunnel...${NC}"

# Start ngrok in background
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "Waiting for ngrok to start..."
sleep 3

# Get the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Failed to get ngrok URL${NC}"
    echo "Check the log at /tmp/ngrok.log"
    cat /tmp/ngrok.log
    exit 1
fi

echo -e "${GREEN}✅ ngrok tunnel started!${NC}"
echo -e "${GREEN}Public URL: ${NGROK_URL}${NC}\n"

# Update .env.local
echo -e "${YELLOW}📝 Updating .env.local...${NC}"

if grep -q "NEXT_PUBLIC_APP_URL=" .env.local; then
    # Update existing line
    sed -i.bak "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${NGROK_URL}|" .env.local
    echo -e "${GREEN}✅ Updated NEXT_PUBLIC_APP_URL in .env.local${NC}"
else
    # Add new line
    echo "NEXT_PUBLIC_APP_URL=${NGROK_URL}" >> .env.local
    echo -e "${GREEN}✅ Added NEXT_PUBLIC_APP_URL to .env.local${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}\n"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🔄 RESTART your dev server:"
echo "   - Press Ctrl+C to stop current server"
echo "   - Run: npm run dev"
echo ""
echo "2. 🧪 TEST webhook:"
echo "   - Make a test payment with card: 4242424242424242"
echo "   - Payment should auto-complete!"
echo ""
echo "3. 🌐 Your webhook URL:"
echo "   ${NGROK_URL}/api/thawani/webhook"
echo ""
echo "4. ⚠️  IMPORTANT:"
echo "   - Keep this ngrok window open"
echo "   - If you restart ngrok, repeat this script"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Webhooks are now ready to work!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Keep ngrok running
echo "ngrok is running in background (PID: $NGROK_PID)"
echo "To view ngrok web interface: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok and exit"

# Wait for Ctrl+C
trap "echo -e '\n${YELLOW}Stopping ngrok...${NC}'; kill $NGROK_PID 2>/dev/null; exit" INT
wait $NGROK_PID
