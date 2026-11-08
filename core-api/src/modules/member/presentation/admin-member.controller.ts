import { Controller, Get } from '@nestjs/common';
import { AdminMemberService } from '../application/admin-member.service';

@Controller('admins/members')
export class AdminMemberController {
  constructor(private readonly adminMemberService: AdminMemberService) {}

  @Get()
  async list() {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    const data = await this.adminMemberService.list();

    // 4. Send response
    return { data };
  }
}
