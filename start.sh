#!/bin/bash
echo "Starting Backend API on http://localhost:5000..."
(cd server && npm start) &

echo "Starting Frontend App on http://localhost:3000..."
npm run dev
