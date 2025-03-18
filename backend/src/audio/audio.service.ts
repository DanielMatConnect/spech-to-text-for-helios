import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TranscriptDto } from 'src/common/dto';
import { Multer } from 'multer';
import { randomUUID } from 'crypto';
import * as ffmpeg from 'fluent-ffmpeg';
import { nodewhisper, IOptions } from 'nodejs-whisper';

@Injectable()
export class AudioService {
  private readonly tempDir = path.join(process.cwd(), 'uploads');
  private readonly defaultOptions: IOptions = {
    modelName: 'base',
    withCuda: false,
    removeWavFileAfterTranscription: false,
    logger: console,
  };

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async transcribeAudio(file: Multer.File): Promise<TranscriptDto> {
    // Se extrae la extensión; sin importar cuál sea, se realizará conversión a WAV
    const ext = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(this.tempDir, filename);
    let audioPathToUse = '';

    try {
      if (file.buffer) {
        fs.writeFileSync(filepath, file.buffer);
      }

      // Siempre convertimos a WAV para garantizar que el archivo sea válido
      audioPathToUse = await this.convertAudioToWav(filepath);
      console.log(`Audio path to use: ${audioPathToUse}`);

      // Llamamos a nodewhisper pasando la ruta del archivo convertido y las opciones
      const transcription = await nodewhisper(audioPathToUse, this.defaultOptions);
      return { text: transcription.trim() };
    } catch (error: any) {
      console.error('Error detallado en la transcripción:', error);
      throw new Error(`Error al procesar el audio: ${error.message}`);
    } finally {
      // Eliminamos los archivos temporales
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        if (typeof audioPathToUse !== 'undefined' && fs.existsSync(audioPathToUse)) {
          fs.unlinkSync(audioPathToUse);
        }
      } catch (cleanupError) {
        console.error('Error al limpiar archivos temporales:', cleanupError);
      }
    }
  }

  private async convertAudioToWav(inputPath: string): Promise<string> {
    // Se genera un nuevo nombre para el archivo convertido
    const outputPath = inputPath.replace(/\.[^/.]+$/, '_converted.wav');
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Error en FFmpeg: ${err.message}`)))
        .save(outputPath);
    });
  }
}
