#!/bin/bash

# Load the API key from .env
export $(grep -v '^#' ../.env | xargs)

curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X GET