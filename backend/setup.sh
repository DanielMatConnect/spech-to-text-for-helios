#!/bin/sh
# Instalar dependencias
echo "Installing dependencies..."
npm install

# Descargar el modelo whisper sin CUDA automáticamente
echo "Downloading whisper model..."
export WHISPER_NO_CUDA=true
export WHISPER_CACHE_DIR=./.cache/whisper
mkdir -p ./.cache/whisper
echo "large-v3-turbo" | npx nodejs-whisper download

# Mensaje de finalización
echo "Setup completed! Now you can build the Docker image."
