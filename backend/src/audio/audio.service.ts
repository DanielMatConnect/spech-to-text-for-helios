import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TranscriptDto } from 'src/common/dto';
import { Multer } from 'multer';
import { randomUUID } from 'crypto';
import * as ffmpeg from 'fluent-ffmpeg';
import { nodewhisper, IOptions } from 'nodejs-whisper';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private readonly tempDir = path.join(process.cwd(), 'uploads');
  private readonly defaultOptions: IOptions = {
    modelName: 'large-v3-turbo',
    withCuda: false,
    removeWavFileAfterTranscription: true,
    logger: undefined
  };

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      this.logger.log(`Creando directorio temporal: ${this.tempDir}`);
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async transcribeAudio(file: Multer.File): Promise<TranscriptDto> {
    this.logger.log('Iniciando proceso de transcripción de audio');
    const ext = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(this.tempDir, filename);
    let audioPathToUse = '';

    try {
      if (file.buffer) {
        this.logger.debug(`Guardando archivo temporal: ${filepath}`);
        fs.writeFileSync(filepath, file.buffer);
      }

      this.logger.log('Convirtiendo audio a formato WAV');
      audioPathToUse = await this.convertAudioToWav(filepath);
      
      this.logger.log('Iniciando transcripción con Whisper');
      const transcription = await nodewhisper(audioPathToUse, this.defaultOptions);
      
      this.logger.debug('Limpiando texto de transcripción');
      const cleanText = transcription
        .replace(/\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]/g, '')
        .trim()
        .replace(/^\s+/gm, '');
      
      this.logger.log('Transcripción completada exitosamente');
      return { text: cleanText };
    } catch (error: any) {
      this.logger.error(`Error en la transcripción: ${error.message}`, error.stack);
      throw new Error(`Error al procesar el audio: ${error.message}`);
    } finally {
      try {
        this.logger.debug('Limpiando archivos temporales');
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        if (!this.defaultOptions.removeWavFileAfterTranscription && 
            typeof audioPathToUse === 'string' && 
            fs.existsSync(audioPathToUse)) {
          fs.unlinkSync(audioPathToUse);
        }
      } catch (cleanupError) {
        this.logger.warn('Error al limpiar archivos temporales', cleanupError);
      }
    }
  }

  private async convertAudioToWav(inputPath: string): Promise<string> {
    const outputPath = inputPath.replace(/\.[^/.]+$/, '_converted.wav');
    this.logger.debug(`Convirtiendo audio: ${inputPath} -> ${outputPath}`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFrequency(16000) // Frecuencia óptima para Whisper
        .audioChannels(1)      // Mono audio para mejor rendimiento
        .audioCodec('pcm_s16le')
        .on('end', () => {
          this.logger.debug('Conversión de audio completada');
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error('Error en la conversión de audio', err);
          reject(new Error(`Error en la conversión de audio: ${err.message}`));
        })
        .save(outputPath);
    });
  }
}
