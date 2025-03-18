import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [AudioModule, LlmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
