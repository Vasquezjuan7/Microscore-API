import { IsString, IsNumber, Min, IsUUID, IsNotEmpty } from 'class-validator';

export class SolicitudDto {
  @IsUUID()
  idCliente: string;

  @IsNumber()
  @Min(1)
  monto: number;

  @IsString()
  @IsNotEmpty()
  proposito: string;

  // Ingresos mensuales
  @IsNumber()
  @Min(0)
  ingresos: number;
}
