import { IsString, IsEmail, IsInt, Min, Max, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class ClienteDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  // Se guarda en minúsculas para que "Ana@x.com" y "ana@x.com" sean el mismo cliente
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(150, { message: 'El email no puede superar los 150 caracteres' })
  email: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(18, { message: 'El cliente debe ser mayor de 18 años' })
  @Max(120, { message: 'La edad no es válida' })
  edad: number;
}

// Para PATCH: todos los campos son opcionales, pero los que se envían se validan igual
export class ActualizarClienteDto extends PartialType(ClienteDto) {}
