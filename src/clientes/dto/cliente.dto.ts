import { IsString, IsEmail, IsInt, Min, IsNotEmpty } from 'class-validator';

export class ClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18, { message: 'El cliente debe ser mayor de 18 años.' })
  edad: number;
}
