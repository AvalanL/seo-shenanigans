#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/generate-google-image-rest.sh "Prompt text"
# Requires: curl, jq, base64

: "${GOOGLE_AI_STUDIO_API_KEY:=${GEMINI_API_KEY:-}}"
if [[ -z "$GOOGLE_AI_STUDIO_API_KEY" ]]; then
  echo "Missing API key. Set GOOGLE_AI_STUDIO_API_KEY or GEMINI_API_KEY." >&2
  exit 1
fi

MODEL_ID=${GOOGLE_IMAGEN_MODEL:-${GOOGLE_GENAI_MODEL:-gemini-2.5-flash-image-preview}}
PROMPT=${1:-"Nano Banana mascot, vibrant vector brand illustration"}
OUTPUT_DIR=${GOOGLE_IMAGE_OUTPUT_DIR:-"$(pwd)/generated-images"}
BASENAME=${GOOGLE_IMAGE_BASENAME:-google-genai-image}

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to parse the API response." >&2
  exit 1
fi

REQUEST_JSON=$(mktemp)
RESPONSE_JSON=$(mktemp)
trap 'rm -f "$REQUEST_JSON" "$RESPONSE_JSON"' EXIT

jq -n --arg prompt "$PROMPT" '{
  contents: [
    {
      role: "user",
      parts: [ { text: $prompt } ]
    }
  ],
  generationConfig: {
    responseModalities: ["IMAGE", "TEXT"]
  }
}' > "$REQUEST_JSON"

HTTP_STATUS=$(curl \
  -sS \
  -o "$RESPONSE_JSON" \
  -w '%{http_code}' \
  -X POST \
  -H 'Content-Type: application/json' \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GOOGLE_AI_STUDIO_API_KEY}" \
  -d @"$REQUEST_JSON")

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "Request failed with HTTP $HTTP_STATUS" >&2
  cat "$RESPONSE_JSON" >&2
  exit 1
fi

IMAGE_COUNT=$(jq '.candidates[]?.content?.parts[]? | select(.inlineData) | 1' "$RESPONSE_JSON" | wc -l | tr -d ' ')

if [[ "$IMAGE_COUNT" -eq 0 ]]; then
  echo "No image data returned. Full response:" >&2
  cat "$RESPONSE_JSON" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
INDEX=0
jq -r '.candidates[]?.content?.parts[]? | select(.inlineData) | @base64' "$RESPONSE_JSON" | while read -r part; do
  inline=$(printf '%s' "$part" | base64 --decode)
  mime=$(printf '%s' "$inline" | jq -r '.inlineData.mimeType // "image/png"')
  data=$(printf '%s' "$inline" | jq -r '.inlineData.data')
  ext="png"
  if [[ -n "$mime" ]]; then
    ext=$(printf '%s' "$mime" | awk -F'/' '{print $2}')
  fi
  file_path="${OUTPUT_DIR}/${BASENAME}-$(printf '%02d' "$INDEX").${ext}"
  printf '%s' "$data" | base64 --decode > "$file_path"
  echo "Image written to $file_path"
  INDEX=$((INDEX + 1))
done

jq -r '.candidates[]?.content?.parts[]? | select(.text) | .text' "$RESPONSE_JSON" || true
