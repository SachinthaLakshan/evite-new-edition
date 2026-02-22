#!/bin/bash

# Create public assets directory if it doesn't exist
mkdir -p public/assets

# Copy assets from src/assets to public/assets
cp -r src/assets/* public/assets/

# Run the build
npm run build 