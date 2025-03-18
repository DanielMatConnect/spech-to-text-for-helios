docker build -t local-llama3-api .
docker run -d -p 11434:11434 --name local-llama3 local-llama3-api
