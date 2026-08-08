#!/bin/bash
echo "==================================================="
echo "  Discovery Engine App - Setup & Migration"
echo "==================================================="
echo "1. Installing root dependencies..."
npm install

echo "2. Installing server dependencies..."
npm --prefix server install

if [ ! -f "server/.env" ]; then
    echo "Copying server/.env.example to server/.env..."
    cp server/.env.example server/.env
    echo "[NOTE] Please update server/.env with your MySQL credentials!"
fi

echo "3. Running Database Migration & Seeding..."
npm --prefix server run migrate

echo "==================================================="
echo "  Setup Complete! Run ./start.sh to launch."
echo "==================================================="
