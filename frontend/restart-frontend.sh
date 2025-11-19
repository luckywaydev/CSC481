#!/bin/bash
echo "Stopping frontend..."
sudo pkill -f "next dev"
sleep 2
echo "Starting frontend..."
cd /home/lucky/CSC481/frontend
npm run dev
