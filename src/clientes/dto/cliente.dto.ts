import { IsString, IsEmail, IsInt, Min, IsOptional } from 'class-validator';

export class ClienteDto {
  @IsOptional()
  @IsString()
  idCliente?: string;

  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18, { message: 'El cliente debe ser mayor de 18 años.' })
  edad: number;
}
