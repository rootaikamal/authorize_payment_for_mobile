#!/bin/bash

echo "🚀 Deploying Payment Server on Port 5005..."

# Update system
echo "📦 Updating system packages..."
sudo apt update -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "📥 Installing PM2..."
sudo npm install -g pm2

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Stop any existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop payment-server 2>/dev/null || true
pm2 delete payment-server 2>/dev/null || true

# Start the payment server with PM2
echo "🚀 Starting payment server on port 5005..."
pm2 start minimal-payment-form.js --name "payment-server" --env PORT=5005

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo "🔧 Setting up PM2 to start on boot..."
pm2 startup

# Open port 5005 in firewall
echo "🔥 Opening port 5005 in firewall..."
sudo ufw allow 5005

# Show status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Payment Form: http://15.206.253.123:5005/payment-form"
echo "📱 API Endpoint: http://15.206.253.123:5005/api/process-payment"
echo "🔑 API Login ID: 8nTEhg6Z6X"
echo "💳 Test Card: 4242424242424242"
echo ""
echo "📋 Useful Commands:"
echo "  pm2 status          - Check server status"
echo "  pm2 logs payment-server - View logs"
echo "  pm2 restart payment-server - Restart server"
echo "  pm2 stop payment-server - Stop server" 