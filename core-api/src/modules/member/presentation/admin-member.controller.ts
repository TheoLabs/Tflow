import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { AdminMemberService } from '../application/admin-member.service';
import { AdminMemberQueryDto, MemberCreateDto } from './dto';

@Controller('admins/members')
export class AdminMemberController {
  constructor(private readonly adminMemberService: AdminMemberService) {}

  @Post()
  async create(@Body() body: MemberCreateDto) {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    await this.adminMemberService.create(body);

    // 4. Send response
    return { data: {} };
  }

  @Get()
  async list(@Query() query: AdminMemberQueryDto) {
    // 1. Destructure body, params, query
    const { email, ...options } = query;

    // 2. Get context
    // 3. Get result
    const data = await this.adminMemberService.list({ email }, options);

    // 4. Send response
    return { data };
  }
}
