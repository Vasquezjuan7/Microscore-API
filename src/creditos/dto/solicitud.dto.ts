import { IsString, IsNumber, Min, IsUUID, IsNotEmpty } from 'class-validator';

export class SolicitudDto {
  @IsUUID('all', { message: 'El idCliente debe ser un UUID válido' })
  idCliente: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con máximo 2 decimales' })
  @Min(1, { message: 'El monto debe ser de al menos 1' })
  monto: number;

  @IsString({ message: 'El propósito debe ser un texto' })
  @IsNotEmpty({ message: 'El propósito es obligatorio' })
  proposito: string;

  // Ingresos mensuales
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Los ingresos deben ser un número con máximo 2 decimales' })
  @Min(0, { message: 'Los ingresos no pueden ser negativos' })
  ingresos: number;
}
