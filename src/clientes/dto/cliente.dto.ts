import { IsString, IsEmail, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  // Se guarda en minúsculas para que "Ana@x.com" y "ana@x.com" sean el mismo cliente
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @IsInt()
  @Min(18, { message: 'El cliente debe ser mayor de 18 años.' })
  edad: number;
}
