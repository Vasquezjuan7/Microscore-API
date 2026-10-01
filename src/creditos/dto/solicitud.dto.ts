import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class SolicitudDto {
  @IsOptional()
  @IsString()
  idSolicitud?: string;

  @IsString()
  idCliente: string;

  @IsNumber()
  @Min(1)
  monto: number;

  @IsString()
  proposito: string;

  @IsNumber()
  @Min(0)
  ingresos: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
