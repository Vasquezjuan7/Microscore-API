import { IsString, IsNumber, Min, IsUUID, IsNotEmpty } from 'class-validator';

export class SolicitudDto {
  /**
   * ID del cliente que solicita el crédito
   * @example "11111111-1111-4111-8111-111111111111"
   */
  @IsUUID('all', { message: 'El idCliente debe ser un UUID válido' })
  idCliente: string;

  /**
   * Monto solicitado
   * @example 1000
   */
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con máximo 2 decimales' })
  @Min(1, { message: 'El monto debe ser de al menos 1' })
  monto: number;

  /**
   * Destino del crédito (negocio, educacion, emprendimiento e inversion suman puntos)
   * @example "negocio"
   */
  @IsString({ message: 'El propósito debe ser un texto' })
  @IsNotEmpty({ message: 'El propósito es obligatorio' })
  proposito: string;

  /**
   * Ingresos mensuales del cliente
   * @example 600
   */
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Los ingresos deben ser un número con máximo 2 decimales' })
  @Min(0, { message: 'Los ingresos no pueden ser negativos' })
  ingresos: number;
}
