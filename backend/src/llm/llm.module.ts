import { Module } from '@nestjs/common';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';
import { OpenApiModule } from 'src/open-api/open-api.module';

@Module({
  imports: [OpenApiModule],
  controllers: [LLMController],
  providers: [LLMService],
  exports: [LLMService],
})
export class LlmModule {}
