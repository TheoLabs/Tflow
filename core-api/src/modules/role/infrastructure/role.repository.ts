import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Role } from '../domain/role.entity';

@Injectable()
export class RoleRepository extends DddRepository<Role> {
  entityClass = Role;

  async find() {}

  async count() {}
}
