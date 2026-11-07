import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../infrastructure/role.repository';

@Injectable()
export class AdminRoleService extends DddService {
  constructor(private readonly roleRepository: RoleRepository) {
    super();
  }
}
