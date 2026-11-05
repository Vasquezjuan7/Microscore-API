import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { ESTADOS_CREDITO } from '../../common/constantes';

export type EstadoCredito = (typeof ESTADOS_CREDITO)[number];

// Algunos drivers devuelven los decimales como string; esto los convierte a number al leer.
const decimalANumero = {
  to: (valor: number) => valor,
  from: (valor: string | number) => (valor === null ? null : Number(valor)),
};

@Entity('creditos')
// Garantiza en la base de datos que un cliente tenga como máximo una solicitud PENDIENTE,
// aunque lleguen dos peticiones a la vez.
@Index('UQ_creditos_pendiente_por_cliente', ['id_cliente'], { unique: true, where: "estado = 'PENDIENTE'" })
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

  // Puntos de cada criterio al evaluar (null mientras la solicitud está PENDIENTE)
  @Column('simple-json', { nullable: true })
  desglose: Record<string, number> | null;

  @CreateDateColumn()
  fecha_solicitud: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.creditos)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;
}
