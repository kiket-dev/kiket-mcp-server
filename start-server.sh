#!/bin/bash
# Start Kiket MCP server in WebSocket mode

export KIKET_API_URL="https://kiket.dev"
export KIKET_API_KEY="0f7c155482630c1bf425a2624186d317f5eae7af3923811cd12ef15e84bc2e91"
export KIKET_PROJECT_KEY="kiket"
export MCP_TRANSPORT="websocket"
export MCP_PORT="3001"
export LOG_LEVEL="info"

cd "$(dirname "$0")"
node dist/server.js
