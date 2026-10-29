import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

export type EstadoCredito = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

// Algunos drivers devuelven los decimales como string; esto los convierte a number al leer.
const decimalANumero = {
  to: (valor: number) => valor,
  from: (valor: string | number) => (valor === null ? null : Number(valor)),
};

@Entity('creditos')
export class Credito {
  @PrimaryGeneratedColumn('uuid')
  id_solicitud: string;

  @Column()
  id_cliente: string;

  @Column('decimal', { precision: 12, scale: 2, transformer: decimalANumero })
  monto: number;

  @Column()
  proposito: string;

  // Ingresos mensuales declarados por el cliente
  @Column('decimal', { precision: 12, scale: 2, transformer: decimalANumero })
  ingresos: number;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado: EstadoCredito;

  @Column('int', { nullable: true })
  puntaje: number;

  @CreateDateColumn()
  fecha_solicitud: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.creditos)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;
}
