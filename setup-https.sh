#!/bin/bash
# MW Translate — Generate local SSL cert
echo "🔐 Generating self-signed SSL certificate..."
openssl req -x509 -newkey rsa:2048 \
  -keyout cert.key -out cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost" \
  -addext "subjectAltName=IP:127.0.0.1,DNS:localhost" \
  2>/dev/null
echo "✅ cert.pem + cert.key created"
echo "🚀 Starting server..."
node server.js
