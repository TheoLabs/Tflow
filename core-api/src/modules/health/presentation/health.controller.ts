import { Context, ContextKey } from '@libs/context';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private readonly context: Context) {}

  @Get()
  healthCheck() {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    // 4. Send response
    return { data: 'OK' };
  }
}
