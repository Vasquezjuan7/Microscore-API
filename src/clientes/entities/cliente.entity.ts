import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Credito } from '../../creditos/entities/credito.entity';
import { FECHA_CREACION_CON_MILISEGUNDOS } from '../../common/columnas';

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

  @CreateDateColumn(FECHA_CREACION_CON_MILISEGUNDOS)
  fecha_registro: Date;

  @OneToMany(() => Credito, (credito) => credito.cliente)
  creditos: Credito[];
}
