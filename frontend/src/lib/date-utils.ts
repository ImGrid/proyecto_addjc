import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Utilidades para manejar fechas tipo DATE (sin hora) del backend
// Resuelve el problema de timezone donde new Date("2026-01-19") se interpreta
// como UTC y al convertir a hora local (Bolivia UTC-4) muestra el dia anterior.
// Solucion basada en: https://github.com/prisma/prisma/issues/18257
// y documentacion de date-fns: https://date-fns.org/docs/parseISO

// Parsea una fecha DATE del backend (string ISO o Date)
// parseISO trata strings date-only como medianoche LOCAL, no UTC
// Esto evita el bug de "dia anterior" en zonas horarias negativas
export function parseDateOnly(date: string | Date): Date {
  if (date instanceof Date) {
    // Si ya es Date, extraer solo la parte de fecha y reparsear
    const isoString = date.toISOString().split('T')[0];
    return parseISO(isoString);
  }
  // Si es string, extraer solo la parte de fecha (sin hora/timezone)
  const dateOnly = String(date).split('T')[0];
  return parseISO(dateOnly);
}

// Formatea una fecha DATE para mostrar al usuario
// Opciones predefinidas para consistencia en toda la app
export function formatDateDisplay(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy'
): string {
  const parsed = parseDateOnly(date);
  return format(parsed, formatStr, { locale: es });
}

// Formatea fecha completa con dia de semana
// Ejemplo: "lunes, 19 de enero de 2026"
export function formatDateFull(date: string | Date): string {
  const parsed = parseDateOnly(date);
  return format(parsed, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

// Formatea fecha corta
// Ejemplo: "19 ene"
export function formatDateShort(date: string | Date): string {
  const parsed = parseDateOnly(date);
  return format(parsed, 'dd MMM', { locale: es });
}

// Formatea fecha media
// Ejemplo: "19 ene 2026"
export function formatDateMedium(date: string | Date): string {
  const parsed = parseDateOnly(date);
  return format(parsed, 'dd MMM yyyy', { locale: es });
}

// Formatea para input type="date" (YYYY-MM-DD)
// Usado en formularios de edicion
export function formatDateForInput(date: string | Date): string {
  const parsed = parseDateOnly(date);
  return format(parsed, 'yyyy-MM-dd');
}

// Formatea con opciones personalizadas de toLocaleDateString
// Para compatibilidad con codigo existente que usa toLocaleDateString
export function formatDateLocale(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  const parsed = parseDateOnly(date);
  return parsed.toLocaleDateString('es-ES', options);
}

// Obtiene timestamp para comparaciones y ordenamiento
// Util para sort() y comparaciones de fechas
export function getDateTimestamp(date: string | Date): number {
  return parseDateOnly(date).getTime();
}

// Compara si una fecha es mayor que otra
export function isDateAfter(date: string | Date, compareDate: Date): boolean {
  return parseDateOnly(date) > compareDate;
}
