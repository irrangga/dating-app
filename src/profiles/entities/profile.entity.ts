import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "first_name", nullable: true })
  firstName: string;

  @Column({ name: "last_name", nullable: true })
  lastName: string;

  @Column("date", { name: "date_of_birth", nullable: true })
  dateOfBirth: Date

  @Column({ nullable: true })
  gender: string;

  @Column("varchar", { name: "is_liked_by", default: [], array: true })
  isLikedBy: string[];

  @Column({ name: "phone_number", unique: true })
  phoneNumber: string;

  @Column()
  password: string;
}
