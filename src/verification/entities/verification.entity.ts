import { BaseEntity } from '@src/shared/database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('verification')
export class VerificationEntity extends BaseEntity {
  @Column({ name: 'user_id', length: 36, type: 'varchar' })
  userId: string;

  @Column({ name: 'token', type: 'varchar' })
  token: string;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiresAt: Date;
}
