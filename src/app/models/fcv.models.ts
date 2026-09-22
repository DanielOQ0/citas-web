export type UserRole = 'USER' | 'PROFESSIONAL' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  documento: string;
  eps?: string;
  plan?: string;
  avatarText: string;
  sedeAsignada?: string;
  consultorioAsignado?: string;
}

export type AppointmentStatus =
  | 'Confirmada'
  | 'Pendiente de aprobación'
  | 'Rechazada'
  | 'Realizada'
  | 'Cancelada'
  | 'No asistió';

export interface AuditEvent {
  estado: string;
  fechaHora: string;
  actor: string;
  fuente: string;
  descripcion?: string;
  isCurrent?: boolean;
}

export interface Cita {
  id: string;
  codigo: string; // e.g. '#FCV-8821'
  pacienteId: string;
  pacienteNombre: string;
  pacienteDoc: string;
  pacienteAvatar: string;
  especialidad: string;
  tipo: 'general' | 'especializada';
  profesionalNombre: string;
  profesionalSubtitulo: string;
  profesionalFoto?: string;
  profesionalRegistro?: string;
  sede: string;
  consultorio: string;
  fechaTexto: string;
  fechaIso: string;
  hora: string;
  duracionMinutos: number;
  estado: AppointmentStatus;
  motivoRechazo?: string;
  cambioPropuesto?: {
    fechaTexto: string;
    horaTexto: string;
    sedeTexto: string;
    consultorioTexto: string;
    medicoTexto: string;
    estado: 'pendiente_paciente' | 'aprobada' | 'rechazada';
  };
  observacionAsistencial?: string;
  registroHoraConfirmado?: string;
  trazabilidad: AuditEvent[];
}

export interface SolicitudReprogramacion {
  id: string;
  codigo: string; // e.g. '#REP-4019'
  citaId: string;
  pacienteNombre: string;
  pacienteDoc: string;
  especialidad: string;
  profesional: string;
  sede: string;
  consultorio: string;
  fechaActual: string;
  horaActual: string;
  fechaPropuesta: string;
  horaPropuesta: string;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export interface ProfesionalSalud {
  codigo: string; // PROF-101
  nombre: string;
  email: string;
  registroSintetico: string;
  especialidadPrincipal: string;
  duracionMin: number;
  sedes: string[];
  estado: 'Activo' | 'Inactivo';
  avatarColor: string;
  foto?: string;
}

export interface EspecialidadMedica {
  codigo: string;
  nombre: string;
  subtitulo: string;
  duracionMin: number;
  tipo: 'general' | 'especializada';
}

export interface SedeHospitalaria {
  codigo: string;
  nombre: string;
  ciudad: string;
  alias: string;
}

export interface EntidadEPS {
  codigo: string;
  nombre: string;
  planes: string[];
}
