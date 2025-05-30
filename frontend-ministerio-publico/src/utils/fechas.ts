import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatearFecha = (fechaString: string, formato: string = 'dd/MM/yyyy HH:mm'): string => {
  try {
    if (!fechaString) return 'Sin fecha';
    
    // Intentar parsear la fecha
    let fecha: Date;
    if (fechaString.includes('T') || fechaString.includes('Z')) {
      // Formato ISO
      fecha = parseISO(fechaString);
    } else {
      // Formato simple
      fecha = new Date(fechaString);
    }
    
    if (!isValid(fecha)) {
      return 'Fecha inválida';
    }
    
    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fechaString; // Devolver el string original si falla
  }
};

export const formatearFechaCorta = (fechaString: string): string => {
  return formatearFecha(fechaString, 'dd/MM/yyyy');
};

export const formatearFechaLarga = (fechaString: string): string => {
  return formatearFecha(fechaString, 'dd/MM/yyyy HH:mm:ss');
};

export const formatearFechaRelativa = (fechaString: string): string => {
  try {
    const fecha = parseISO(fechaString);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    
    return formatearFechaCorta(fechaString);
  } catch {
    return formatearFecha(fechaString);
  }
};
