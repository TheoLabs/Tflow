import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { stripUndefined } from '@libs/utils';
import { isEqual } from 'lodash';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export abstract class DddBaseAggregate {
  @CreateDateColumn({ select: false })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, select: false, nullable: true })
  private createdBy: string | null;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, select: false, nullable: true })
  private updatedBy: string | null;

  setTxId(txId: string) {
    if (!this.createdBy) {
      this.createdBy = txId;
    }
    this.updatedBy = txId;
  }

  /**
   * @param changed 변경된 obj
   * @returns 현재 객체와 changed를 비교해 변경된 부분만 반환한다. 바뀐 게 없으면 undefined.
   */
  protected stripUnchanged(changed: { [key: string]: any }) {
    const compared = Object.keys(changed).reduce((acc: { [key: string]: any }, prop) => {
      const originValue = this[prop as keyof typeof this];
      const changedValue = changed[prop];
      acc[prop] = !isEqual(originValue, changedValue) ? changedValue : undefined;
      return acc;
    }, {});

    return stripUndefined(compared);
  }

  toInstance<T>(dto: ClassConstructor<T>, args?: Record<string, unknown>) {
    return plainToInstance(dto, { ...this, ...args });
  }
}
