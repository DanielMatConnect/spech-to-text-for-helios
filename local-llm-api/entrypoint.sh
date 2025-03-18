#!/bin/sh
set -e

# Inicia Ollama en segundo plano
ollama serve &

# Espera hasta que Ollama esté listo
until curl --output /dev/null --silent --head --fail http://localhost:11434; do
    printf '.'
    sleep 1
done

# Descarga modelo mistral si aún no está disponible
ollama pull mistral

# Mantiene el contenedor activo
wait
