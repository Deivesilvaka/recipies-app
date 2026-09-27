import { BaseEntity } from '@src/shared/database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'birthdate', type: 'varchar', length: 10, nullable: false })
  birthdate: string;

  @Column({ name: 'email', type: 'varchar', nullable: false })
  email: string;

  @Column({ name: 'password', type: 'varchar', nullable: false, select: false })
  password: string;

  @Column({ name: 'phone_number', type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({
    name: 'is_terms_accepted',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isTermsAccepted: boolean;

  @Column({
    name: 'is_activated',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isActivated: boolean;

  @Column({
    name: 'email_validated_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  emailValidatedAt: Date | null;
}
