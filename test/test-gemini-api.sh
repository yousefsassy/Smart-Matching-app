#!/bin/bash

# Load the API key from .env
export $(grep -v '^#' ../.env | xargs)

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{"text": "Testing matching logic: rank 3 service providers."}]
      }]
    }'