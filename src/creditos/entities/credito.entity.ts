import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('creditos')
export class Credito {
  @PrimaryGeneratedColumn('uuid')
  id_solicitud: string;

  @Column()
  id_cliente: string;

  @Column('decimal')
  monto: number;

  @Column({ nullable: true })
  proposito: string;

  @Column({ nullable: true })
  ingresos: number;

  @Column({ default: 'PENDIENTE' })
  estado: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.creditos)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;
}
