import { Context } from '@libs/context';
import { Inject } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export abstract class DddService {
  @Inject()
  private readonly context: Context;

  @InjectEntityManager()
  private readonly entityManager: EntityManager;
}
