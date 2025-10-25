// Centraliza validaciones para el formulario de creación de Olimpiada
// Mantiene lógica sin agregar dependencias externas

export interface OlympiadFormValues {
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  number_of_phases: string | number; // se convierte a número al validar
  default_score_cut: string | number; // se convierte a número al validar
  areas: string[]; // nombres de áreas
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]+$/;

const todayISO = () => new Date().toISOString().split('T')[0];

export function validateOlympiad(values: OlympiadFormValues): ValidationResult {
  const errors: Record<string, string> = {};
  const today = todayISO();

  // Nombre
  const nameTrim = values.name.trim();
  if (!nameTrim) errors.name = 'El nombre de la olimpiada es obligatorio';
  else if (!nameRegex.test(nameTrim)) errors.name = 'Solo se permiten letras, números y espacios';


  // Número de fases
  const n = Number(values.number_of_phases);
  if (values.number_of_phases === '' || values.number_of_phases === null || values.number_of_phases === undefined) {
    errors.number_of_phases = 'El número de etapas es obligatorio';
  } else if (Number.isNaN(n) || !Number.isInteger(n)) {
    errors.number_of_phases = 'Debe ser un número entero';
  } else if (n < 2) {
    errors.number_of_phases = 'Debe ser al menos 2';
  } else if (n > 50) {
    errors.number_of_phases = 'El máximo permitido es 50';
  }

  // Umbral de puntuación (>1 y ≤100, entero, obligatorio)
  const cut = Number(values.default_score_cut);
  if (values.default_score_cut === '' || values.default_score_cut === null || values.default_score_cut === undefined) {
    errors.default_score_cut = 'El umbral de puntuación es obligatorio';
  } else if (Number.isNaN(cut)) {
    errors.default_score_cut = 'El umbral debe ser un número';
  } else if (!Number.isInteger(cut)) {
    errors.default_score_cut = 'El umbral debe ser un número entero';
  } else if (cut < 1) {
    errors.default_score_cut = 'El umbral debe ser mayor a 0';
  } else if (cut > 100) {
    errors.default_score_cut = 'El umbral no puede ser mayor a 100';
  }

  // Fechas
  if (!values.start_date) errors.start_date = 'La fecha de inicio es obligatoria';
  else if (values.start_date < today) errors.start_date = 'No puede ser una fecha pasada';

  if (!values.end_date) errors.end_date = 'La fecha de finalización es obligatoria';
  else if (values.end_date < today) errors.end_date = 'No puede ser una fecha pasada';

  if (values.start_date && values.end_date) {
    if (new Date(values.start_date) > new Date(values.end_date)) {
      errors.end_date = 'Debe ser posterior o igual a la fecha de inicio';
    }
  }

  // Áreas
  if (!values.areas || values.areas.length === 0) {
    errors.areas = 'Seleccione al menos un área';
  } else {
    // Validar longitud de cada nombre (max 25 backend)
    const tooLong = values.areas.find(a => a.length > 25);
    if (tooLong) errors.areas = `El área "${tooLong}" excede 25 caracteres`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateField(key: keyof OlympiadFormValues, values: OlympiadFormValues): ValidationResult {
  // Re-usa validateOlympiad pero solo devuelve error del campo específico para simplicidad
  const full = validateOlympiad(values);
  const singleError: Record<string, string> = {};
  if (full.errors[key]) singleError[key as string] = full.errors[key];
  return { valid: !full.errors[key], errors: singleError };
}
