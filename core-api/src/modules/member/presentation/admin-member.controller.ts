import { Controller } from '@nestjs/common';
import { AdminMemberService } from '../application/admin-member.service';

@Controller('admins/members')
export class AdminMemberController {
  constructor(private readonly adminMemberService: AdminMemberService) {}
}
