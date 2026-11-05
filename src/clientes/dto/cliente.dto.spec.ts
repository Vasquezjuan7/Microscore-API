import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClienteDto } from './cliente.dto';

async function errores(datos: object): Promise<string[]> {
  const dto = plainToInstance(ClienteDto, datos);
  const resultado = await validate(dto);
  return resultado.flatMap((e) => Object.values(e.constraints ?? {}));
}

const valido = { nombre: 'Ana Gómez', email: 'ana@correo.com', edad: 30 };

describe('ClienteDto', () => {
  it('acepta un cliente válido', async () => {
    expect(await errores(valido)).toEqual([]);
  });

  it('recorta el nombre y normaliza el email', () => {
    const dto = plainToInstance(ClienteDto, { ...valido, nombre: '  Ana  ', email: ' Ana@Correo.COM ' });
    expect(dto.nombre).toBe('Ana');
    expect(dto.email).toBe('ana@correo.com');
  });

  it('rechaza un nombre vacío o solo con espacios', async () => {
    expect(await errores({ ...valido, nombre: '   ' })).toContain('El nombre es obligatorio');
  });

  it('rechaza un nombre de más de 100 caracteres', async () => {
    expect(await errores({ ...valido, nombre: 'a'.repeat(101) })).toContain(
      'El nombre no puede superar los 100 caracteres',
    );
  });

  it('rechaza un email inválido', async () => {
    expect(await errores({ ...valido, email: 'no-es-email' })).toContain('El email no es válido');
  });

  it.each([17, 121])('rechaza la edad %p', async (edad) => {
    expect((await errores({ ...valido, edad })).length).toBeGreaterThan(0);
  });

  it('rechaza una edad con decimales', async () => {
    expect(await errores({ ...valido, edad: 30.5 })).toContain('La edad debe ser un número entero');
  });
});
