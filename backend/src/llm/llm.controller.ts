import { Controller, Post, Body } from '@nestjs/common';
import { LLMService } from './llm.service';
import { FormConfig, LLMResponseDto } from 'src/common/dto';

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Post('process')
  async processText(
    @Body() body: { 
      text: string;
    }
  ): Promise<LLMResponseDto> {
    return this.llmService.processText(body.text);
  }
}