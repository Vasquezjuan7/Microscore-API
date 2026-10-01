import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Credito } from '../../creditos/entities/credito.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id_cliente: string;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column('int')
  edad: number;

  @OneToMany(() => Credito, (credito) => credito.cliente)
  creditos: Credito[];
}
