import { Column } from 'typeorm';

export abstract class DddBaseAggregate {
  @Column({ select: false })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, select: false, nullable: true })
  private createdBy: string | null;

  @Column({ select: false })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, select: false, nullable: true })
  private updatedBy: string | null;

  setTxId(txId: string) {
    if (!this.createdBy) {
      this.createdBy = txId;
    }
    this.updatedBy = txId;
  }
}
