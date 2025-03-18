FROM ollama/ollama:latest

EXPOSE 11434

ENTRYPOINT ["sh", "-c", "ollama serve & sleep 5 && ollama pull llama3 && wait"]
