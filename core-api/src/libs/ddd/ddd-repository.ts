import { Context, ContextKey } from '@libs/context';
import { DddBaseAggregate } from './ddd-base-aggregate';
import { DataSource, EntityManager, ObjectType } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export abstract class DddRepository<T extends DddBaseAggregate> {
  constructor(
    @InjectDataSource() private readonly datasource: DataSource,
    private readonly context: Context
  ) {}

  abstract entityClass: ObjectType<T>;

  get entityManager(): EntityManager {
    // NOTE:컨텍스트에서 엔티티 매니저를 가져오거나, 데이터소스에서 가져옴
    return this.context.get<EntityManager>(ContextKey.ENTITY_MANAGER) || this.datasource.manager;
  }

  async save(entities: T[]): Promise<void> {
    this.registerTxId(entities);

    await this.entityManager.save(this.entityClass, entities);
  }

  async remove(entities: T[]): Promise<void> {
    this.registerTxId(entities);

    await this.entityManager.softRemove(this.entityClass, entities);
  }

  private registerTxId(entities: T[]) {
    const txId = this.context.get<string>(ContextKey.TXID);
    entities.forEach((entity) => entity.setTxId(txId));
  }
}
