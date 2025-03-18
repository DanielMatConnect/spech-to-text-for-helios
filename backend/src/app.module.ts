import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { LlmModule } from './llm/llm.module';
import { OpenApiModule } from './open-api/open-api.module';

@Module({
  imports: [AudioModule, LlmModule, OpenApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
