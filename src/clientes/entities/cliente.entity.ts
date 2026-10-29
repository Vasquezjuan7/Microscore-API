import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Credito } from '../../creditos/entities/credito.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id_cliente: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column('int')
  edad: number;

  @CreateDateColumn()
  fecha_registro: Date;

  @OneToMany(() => Credito, (credito) => credito.cliente)
  creditos: Credito[];
}
