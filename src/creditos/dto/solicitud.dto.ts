import { IsString, IsNumber, Min, IsUUID, IsNotEmpty } from 'class-validator';

export class SolicitudDto {
  @IsUUID()
  idCliente: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  monto: number;

  @IsString()
  @IsNotEmpty()
  proposito: string;

  // Ingresos mensuales
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ingresos: number;
}
