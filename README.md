# Proyecto de Asistencia Vehicular

Este proyecto consta de tres componentes principales: frontend (React), backend (NestJS), y un servicio LLM local (Ollama).

## Requisitos Previos

- Node.js (v20 o superior)
- Python 3
- FFmpeg
- npm o yarn
- Git

## Instalación y Configuración

### 1. Backend (NestJS)

```bash
# Navegar al directorio del frontend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx nodejs-whisper download

# Descargar el modelo de Whisper
# Puedes elegir entre los siguientes modelos según tus necesidades:
# - tiny: Más rápido pero menos preciso (~1GB RAM)
# - base: Balance entre velocidad y precisión (~1GB RAM)
# - small: Buena precisión, velocidad moderada (~2GB RAM)
# - medium: Alta precisión, más lento (~5GB RAM)
# - large-v3: Máxima precisión, muy lento (~10GB RAM)
# - large-v3-turbo: Similar a large-v3 pero optimizado para velocidad

# Ejemplo para descargar el modelo large-v3-turbo:

# El frontend estará disponible en http://localhost:5173
```

### 2. Frontend (React)

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev

# El frontend estará disponible en http://localhost:5173
```

### 3. Servicio LLM (Ollama)

```bash
# Instalar Ollama según tu sistema operativo
# Ver instrucciones en: https://ollama.ai/download

# Iniciar el servicio Ollama
ollama serve

# En otra terminal, descargar el modelo
ollama pull llama3

# El servicio LLM estará disponible en http://localhost:11434
```

## Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
WHISPER_NO_CUDA=true
WHISPER_CACHE_DIR=./.cache/whisper
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Desarrollo

1. Asegúrate de que todos los servicios estén corriendo:
   - Backend en puerto 3000
   - Frontend en puerto 5173
   - Ollama en puerto 11434

2. El frontend se comunicará con el backend a través de http://localhost:3000
3. El backend procesará el audio usando Whisper y se comunicará con Ollama para el procesamiento de lenguaje natural

## Solución de Problemas Comunes

1. **Error de FFmpeg**: Asegúrate de tener FFmpeg instalado en tu sistema
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # MacOS
   brew install ffmpeg

   # Windows
   # Descargar de https://ffmpeg.org/download.html
   ```

2. **Error de Whisper**: Verifica que el modelo se descargó correctamente
   ```bash
   ls -la .cache/whisper
   ```

3. **Error de Ollama**: Asegúrate de que el servicio está corriendo
   ```bash
   curl http://localhost:11434/api/health
   ```

## Scripts Útiles

### Backend
- `npm run start:dev` - Inicia en modo desarrollo con hot-reload
- `npm run build` - Compila el proyecto
- `npm run start:prod` - Inicia en modo producción
- `npm run test` - Ejecuta las pruebas

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa de la build de producción

## Notas Adicionales

- Asegúrate de tener suficiente espacio en disco para los modelos de Whisper y Ollama
- El modelo Whisper ocupa aproximadamente 3GB
- El modelo Llama3 ocupa aproximadamente 4GB
- Se recomienda tener al menos 16GB de RAM disponible 