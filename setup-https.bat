@echo off
echo Generating self-signed SSL certificate...
openssl req -x509 -newkey rsa:2048 -keyout cert.key -out cert.pem -days 365 -nodes -subj "/CN=localhost" 2>nul
echo cert created
node server.js
