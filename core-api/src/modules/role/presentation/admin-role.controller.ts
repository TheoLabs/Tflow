import { Controller } from '@nestjs/common';
import { AdminRoleService } from '../application/admin-role.repository';

@Controller('admins/roles')
export class AdminRoleController {
  constructor(private readonly adminRoleService: AdminRoleService) {}
}
