import { IsIn, IsOptional } from 'class-validator';
import { ESTADOS_CREDITO } from '../../common/constantes';
import { EstadoCredito } from '../entities/credito.entity';

// Parámetros de consulta de GET /creditos
export class FiltroCreditosDto {
  @IsOptional()
  @IsIn(ESTADOS_CREDITO, { message: `El estado debe ser uno de: ${ESTADOS_CREDITO.join(', ')}` })
  estado?: EstadoCredito;
}
