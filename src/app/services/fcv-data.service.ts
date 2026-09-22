import { Injectable, signal, computed } from '@angular/core';
import {
  UserProfile,
  Cita,
  AppointmentStatus,
  SolicitudReprogramacion,
  ProfesionalSalud,
  EspecialidadMedica,
  SedeHospitalaria,
  EntidadEPS,
  UserRole,
} from '../models/fcv.models';

export interface ToastInfo {
  show: boolean;
  title: string;
  message: string;
  icon: string;
  type?: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class FcvDataService {
  // Preset Users
  readonly userPaciente: UserProfile = {
    id: 'user-paciente-1',
    name: 'Carlos Andrés Pérez',
    email: 'carlos.perez@fcv.edu.co',
    role: 'USER',
    roleTitle: 'Paciente',
    documento: 'CC 1.098.765.432',
    eps: 'EPS Demo A',
    plan: 'Plan Demo 1',
    avatarText: 'CP',
  };

  readonly userDoctor: UserProfile = {
    id: 'user-doc-1',
    name: 'Dr. Camilo Restrepo',
    email: 'camilo.restrepo@fcv.edu.co',
    role: 'PROFESSIONAL',
    roleTitle: 'Profesional',
    documento: 'CC 88.341.209',
    avatarText: 'CR',
    sedeAsignada: 'Sede Norte',
    consultorioAsignado: 'Cons. 204',
  };

  readonly userAdmin: UserProfile = {
    id: 'user-admin-1',
    name: 'Administración Clínica FCV',
    email: 'admin@fcv.edu.co',
    role: 'ADMIN',
    roleTitle: 'Administrador',
    documento: 'NIT 890.201.214-5',
    avatarText: 'AD',
  };

  // State Signals
  readonly currentUser = signal<UserProfile>(this.userPaciente);
  readonly isAuthenticated = signal<boolean>(false);

  readonly toast = signal<ToastInfo>({
    show: false,
    title: '',
    message: '',
    icon: 'check_circle',
    type: 'success',
  });

  // Master Catalogs
  readonly sedes = signal<SedeHospitalaria[]>([
    { codigo: 'LOC-01', nombre: 'Sede Norte', ciudad: 'Floridablanca', alias: 'Clínica Principal FCV' },
    { codigo: 'LOC-02', nombre: 'Sede Sur', ciudad: 'Bucaramanga', alias: 'Centro de Especialistas FCV' },
  ]);

  readonly especialidades = signal<EspecialidadMedica[]>([
    { codigo: 'ESP-GEN-01', nombre: 'Medicina General', subtitulo: 'Atención primaria y filtro', duracionMin: 30, tipo: 'general' },
    { codigo: 'ESP-CARD-02', nombre: 'Cardiología', subtitulo: 'Subespecialidad clínica', duracionMin: 60, tipo: 'especializada' },
    { codigo: 'ESP-DERM-03', nombre: 'Dermatología', subtitulo: 'Procedimientos y control', duracionMin: 60, tipo: 'especializada' },
    { codigo: 'ESP-NEUR-04', nombre: 'Neurología Clínica', subtitulo: 'Neurología Adultos', duracionMin: 45, tipo: 'especializada' },
    { codigo: 'ESP-PED-05', nombre: 'Pediatría', subtitulo: 'Control Pediátrico Integral', duracionMin: 30, tipo: 'general' },
  ]);

  readonly epsList = signal<EntidadEPS[]>([
    { codigo: 'EPS-DEMO-01', nombre: 'EPS Demo A', planes: ['Plan Demo 1', 'Plan Demo 2'] },
    { codigo: 'EPS-DEMO-02', nombre: 'EPS Demo B', planes: ['Plan Integral Demo'] },
  ]);

  readonly profesionales = signal<ProfesionalSalud[]>([
    {
      codigo: 'PROF-101',
      nombre: 'Dr. Roberto Silva Morales',
      email: 'roberto.silva@fcv.edu.co',
      registroSintetico: 'Reg. FCV-40912',
      especialidadPrincipal: 'Medicina General (30 min)',
      duracionMin: 30,
      sedes: ['Sede Norte', 'Sede Sur'],
      estado: 'Activo',
      avatarColor: 'bg-primary text-on-primary',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFjQAkkbMUj_lB3J_i3-6G2qrOdWSq05Odk43WMsFUizXGVw6EgkSHM0dsKai5gFDru9SffV_9ByOT-DG8Ef06-6aD6t4i9NNammEXZoKrCeJNXm9sO5Fv7Zr91OBOLUPudC3HRp49n75j-LFoHaWnS0iRBye3QQ0zF15nVDKD_13pzw-VCRPQsMeOITYYx9g17cCrowgZ4dtj1H6MumwTuSZoahVz4-HlZSF0Lhmjwqr99YCW6XQU7Q',
    },
    {
      codigo: 'PROF-102',
      nombre: 'Dra. María Elena Torres',
      email: 'maria.torres@fcv.edu.co',
      registroSintetico: 'Reg. FCV-99120',
      especialidadPrincipal: 'Cardiología (60 min)',
      duracionMin: 60,
      sedes: ['Sede Sur'],
      estado: 'Activo',
      avatarColor: 'bg-secondary-container text-on-secondary-container',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTit01jSVa06L3U9v0RKn-plgLdd9pINdQa4f2cZ6IhCCW24cKDmyOZZoFcPBbVrJBU_mnjjxfSXly7h14zC7-nLz3WQQd8u-1GoWDOh2BWevnmqZFoqB-eRBLPnUnjmlrrDazzDOcbv2lFsfWnfI6vUbbir8sIp8u3P5cmIe17MQ0ez50MAiKi_sR_JshkSSNGSniifa_yzWrB6v3MeqP36RJu4TLv7tNtpvt74PeiUxsWFbTNRYu4g',
    },
    {
      codigo: 'PROF-103',
      nombre: 'Dra. Claudia Restrepo',
      email: 'claudia.restrepo@fcv.edu.co',
      registroSintetico: 'Reg. FCV-38821',
      especialidadPrincipal: 'Medicina General (30 min)',
      duracionMin: 30,
      sedes: ['Sede Norte'],
      estado: 'Inactivo',
      avatarColor: 'bg-outline-variant text-on-surface-variant',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqSA-QTKqXSIZ0UUXlZQ2bsVqVYWUBlofzNwKxejH2y3uxaGUvEFfLSZbIid8tHTAU-1bpHfSDxHrshUhnX41XARg2IhgE-TBiYd2cblMy3BrwzwNqa0z7kjN62abtJHjcOE_piE7q3pasUmNSOhwVpwHoKtmE8vF9pXo6grGg-A5uPXkfF1rZqUL23CgSUN29cODRU4Q1JApXJtuJiRi6lLFEi2hZN_2un6_swaXKuhTirgZxaBdtkA',
    },
    {
      codigo: 'PROF-104',
      nombre: 'Dr. Camilo Restrepo',
      email: 'camilo.restrepo@fcv.edu.co',
      registroSintetico: 'Reg. FCV-51203',
      especialidadPrincipal: 'Medicina General (30 min)',
      duracionMin: 30,
      sedes: ['Sede Norte'],
      estado: 'Activo',
      avatarColor: 'bg-primary text-on-primary',
    },
  ]);

  // Appointments Database
  readonly citas = signal<Cita[]>([
    {
      id: 'cita-1',
      codigo: '#FCV-8821',
      pacienteId: 'user-paciente-1',
      pacienteNombre: 'Carlos Andrés Pérez',
      pacienteDoc: 'CC 1.098.765.432',
      pacienteAvatar: 'CP',
      especialidad: 'Medicina General',
      tipo: 'general',
      profesionalNombre: 'Dr. Roberto Silva Morales',
      profesionalSubtitulo: 'Especialista Docente',
      profesionalRegistro: 'Reg. FCV-40912',
      sede: 'Sede Norte',
      consultorio: 'Cons. 204 · Piso 2',
      fechaTexto: 'Mié, 24 Abr 2024',
      fechaIso: '2024-04-24',
      hora: '08:30 - 09:00',
      duracionMinutos: 30,
      estado: 'Confirmada',
      observacionAsistencial: 'Finalizada · Elegible para resultado',
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: '12 Abr 2024, 14:15',
          actor: 'USER (Carlos Andrés Pérez)',
          fuente: 'USER · Interfaz Web Paciente',
        },
        {
          estado: 'Solicitada',
          fechaHora: '12 Abr 2024, 14:15',
          actor: 'USER',
          fuente: 'USER · Envío de payload de reserva',
        },
        {
          estado: 'Confirmada',
          fechaHora: '12 Abr 2024, 14:16',
          actor: 'SYSTEM',
          fuente: 'SYSTEM (Aprobación automática Medicina General)',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-2',
      codigo: '#FCV-8945',
      pacienteId: 'user-paciente-1',
      pacienteNombre: 'Carlos Andrés Pérez',
      pacienteDoc: 'CC 1.098.765.432',
      pacienteAvatar: 'CP',
      especialidad: 'Cardiología',
      tipo: 'especializada',
      profesionalNombre: 'Dra. María Elena Torres',
      profesionalSubtitulo: 'Cardióloga Electrofisióloga · Sede Sur',
      profesionalRegistro: 'Espec. Reg. FCV-99120',
      sede: 'Sede Sur',
      consultorio: 'Torre Médica · Consultorio 402',
      fechaTexto: 'Jue, 25 Abr 2024',
      fechaIso: '2024-04-25',
      hora: '10:00 - 11:00',
      duracionMinutos: 60,
      estado: 'Pendiente de aprobación',
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: '20 Abr 2024, 09:10',
          actor: 'USER (Carlos Andrés Pérez)',
          fuente: 'USER · Ventanilla Web',
        },
        {
          estado: 'Pendiente de aprobación',
          fechaHora: '20 Abr 2024, 09:11',
          actor: 'SYSTEM',
          fuente: 'SYSTEM · Enrutado a coordinación docente',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-3',
      codigo: '#FCV-8502',
      pacienteId: 'user-paciente-1',
      pacienteNombre: 'Carlos Andrés Pérez',
      pacienteDoc: 'CC 1.098.765.432',
      pacienteAvatar: 'CP',
      especialidad: 'Dermatología',
      tipo: 'especializada',
      profesionalNombre: 'Dra. Sofía Ramírez',
      profesionalSubtitulo: 'Dermatología Quirúrgica',
      sede: 'Sede Norte',
      consultorio: 'Pabellón Quirúrgico · Cons. 215',
      fechaTexto: 'Lun, 15 Abr 2024',
      fechaIso: '2024-04-15',
      hora: '14:00 - 15:00',
      duracionMinutos: 60,
      estado: 'Rechazada',
      motivoRechazo: 'El horario solicitado fue asignado a procedimiento ambulatorio prioritario. Se sugiere seleccionar jornada de tarde.',
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: '10 Abr 2024, 11:00',
          actor: 'USER',
          fuente: 'USER · Interfaz Paciente',
        },
        {
          estado: 'Rechazada',
          fechaHora: '11 Abr 2024, 16:30',
          actor: 'ADMIN (Comité Asistencial)',
          fuente: 'ADMIN · Despacho de cupos quirúrgicos',
          descripcion: 'Cupo prioritario asignado en dicha franja.',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-4',
      codigo: '#FCV-7910',
      pacienteId: 'user-paciente-1',
      pacienteNombre: 'Carlos Andrés Pérez',
      pacienteDoc: 'CC 1.098.765.432',
      pacienteAvatar: 'CP',
      especialidad: 'Pediatría',
      tipo: 'general',
      profesionalNombre: 'Dr. Carlos Méndez',
      profesionalSubtitulo: 'Control Pediátrico',
      sede: 'Sede Sur',
      consultorio: 'Consultorio 102',
      fechaTexto: 'Mié, 10 Abr 2024',
      fechaIso: '2024-04-10',
      hora: '11:00 - 11:30',
      duracionMinutos: 30,
      estado: 'Realizada',
      registroHoraConfirmado: '10 Abr 2024 · 11:28 hrs',
      trazabilidad: [
        {
          estado: 'Confirmada',
          fechaHora: '05 Abr 2024, 10:00',
          actor: 'SYSTEM',
          fuente: 'SYSTEM · Agendamiento Directo',
        },
        {
          estado: 'Realizada',
          fechaHora: '10 Abr 2024, 11:28',
          actor: 'PROFESSIONAL (Dr. Carlos Méndez)',
          fuente: 'PROFESSIONAL · Registro de Asistencia Médica',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-5',
      codigo: '#FCV-8742',
      pacienteId: 'user-paciente-1',
      pacienteNombre: 'Carlos Andrés Pérez',
      pacienteDoc: 'CC 1.098.765.432',
      pacienteAvatar: 'CP',
      especialidad: 'Dermatología',
      tipo: 'especializada',
      profesionalNombre: 'Dra. Sofía Ramírez',
      profesionalSubtitulo: 'Consulta Externa',
      sede: 'Sede Norte',
      consultorio: 'Consultorio 108',
      fechaTexto: 'Vie, 26 Abr 2024',
      fechaIso: '2024-04-26',
      hora: '09:30 - 10:30',
      duracionMinutos: 60,
      estado: 'Confirmada',
      cambioPropuesto: {
        fechaTexto: 'Lun, 29 Abr 2024',
        horaTexto: '14:00 - 15:00',
        sedeTexto: 'Sede Norte',
        consultorioTexto: 'Consultorio 108',
        medicoTexto: 'Dra. Sofía Ramírez',
        estado: 'pendiente_paciente',
      },
      trazabilidad: [
        {
          estado: 'Confirmada',
          fechaHora: '18 Abr 2024, 14:00',
          actor: 'SYSTEM',
          fuente: 'SYSTEM · Reserva confirmada',
        },
        {
          estado: 'Reprogramación Propuesta',
          fechaHora: '22 Abr 2024, 10:15',
          actor: 'ADMIN',
          fuente: 'ADMIN · Propuesta conciliada por necesidad docente',
          isCurrent: true,
        },
      ],
    },
    // Additional appointments for Doctor & Admin views
    {
      id: 'cita-6',
      codigo: '#FCV-8951',
      pacienteId: 'user-paciente-2',
      pacienteNombre: 'Laura Marcela Díaz',
      pacienteDoc: 'CC 63.455.890',
      pacienteAvatar: 'LD',
      especialidad: 'Dermatología',
      tipo: 'especializada',
      profesionalNombre: 'Dra. Sofía Ramírez',
      profesionalSubtitulo: 'Dermatología Quirúrgica',
      sede: 'Sede Norte',
      consultorio: 'Consultorio 215 · Pabellón B',
      fechaTexto: '26 Abr 2024',
      fechaIso: '2024-04-26',
      hora: '14:00 - 15:00',
      duracionMinutos: 60,
      estado: 'Pendiente de aprobación',
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: '21 Abr 2024, 15:00',
          actor: 'USER (Laura Marcela Díaz)',
          fuente: 'USER · Portal Web',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-7',
      codigo: '#FCV-8960',
      pacienteId: 'user-paciente-3',
      pacienteNombre: 'Jorge Enrique Morales',
      pacienteDoc: 'CC 91.220.450',
      pacienteAvatar: 'JM',
      especialidad: 'Neurología Clínica',
      tipo: 'especializada',
      profesionalNombre: 'Dr. Andrés Felipe Ruiz',
      profesionalSubtitulo: 'Neurología Adultos',
      sede: 'Sede Norte',
      consultorio: 'Consultorio 108 · Ala Central',
      fechaTexto: '27 Abr 2024',
      fechaIso: '2024-04-27',
      hora: '09:15 - 10:00',
      duracionMinutos: 45,
      estado: 'Pendiente de aprobación',
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: '22 Abr 2024, 08:30',
          actor: 'USER (Jorge Enrique Morales)',
          fuente: 'USER · Portal Web',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-doc-2',
      codigo: '#FCV-9011',
      pacienteId: 'user-paciente-4',
      pacienteNombre: 'Mariana Gómez',
      pacienteDoc: 'CC 52.341.908',
      pacienteAvatar: 'MG',
      especialidad: 'Medicina General',
      tipo: 'general',
      profesionalNombre: 'Dr. Camilo Restrepo',
      profesionalSubtitulo: 'Medicina General Ambulatoria',
      sede: 'Sede Norte',
      consultorio: 'Cons. 204',
      fechaTexto: 'Mié, 24 Abr 2024',
      fechaIso: '2024-04-24',
      hora: '09:00 - 09:30',
      duracionMinutos: 30,
      estado: 'Realizada',
      registroHoraConfirmado: '09:32 hrs',
      trazabilidad: [
        {
          estado: 'Realizada',
          fechaHora: '24 Abr 2024, 09:32',
          actor: 'Dr. Camilo Restrepo',
          fuente: 'Clínica Móvil Asistencial',
          isCurrent: true,
        },
      ],
    },
    {
      id: 'cita-doc-3',
      codigo: '#FCV-9012',
      pacienteId: 'user-paciente-5',
      pacienteNombre: 'Jorge Eliécer Ruiz',
      pacienteDoc: 'CC 91.240.112',
      pacienteAvatar: 'JR',
      especialidad: 'Medicina General',
      tipo: 'general',
      profesionalNombre: 'Dr. Camilo Restrepo',
      profesionalSubtitulo: 'Medicina General Ambulatoria',
      sede: 'Sede Norte',
      consultorio: 'Sala 2 Norte · Cons. 204',
      fechaTexto: 'Mié, 24 Abr 2024',
      fechaIso: '2024-04-24',
      hora: '10:00 - 10:30',
      duracionMinutos: 30,
      estado: 'Confirmada',
      observacionAsistencial: 'Confirmada · En espera en sala de recepción',
      trazabilidad: [
        {
          estado: 'Confirmada',
          fechaHora: '24 Abr 2024, 07:00',
          actor: 'SYSTEM',
          fuente: 'Admisiones de Recepción Norte',
          isCurrent: true,
        },
      ],
    },
  ]);

  // Solicitudes de Reprogramación
  readonly solicitudesReprog = signal<SolicitudReprogramacion[]>([
    {
      id: 'rep-1',
      codigo: '#REP-4019',
      citaId: 'cita-extra-valeria',
      pacienteNombre: 'Valeria Restrepo Gómez',
      pacienteDoc: 'CC 1.095.421.908',
      especialidad: 'Endocrinología Metabólica',
      profesional: 'Dr. Germán Osorio',
      sede: 'Sede Norte',
      consultorio: 'Módulo 312',
      fechaActual: '24 Abr 2024',
      horaActual: '08:30 AM',
      fechaPropuesta: '29 Abr 2024',
      horaPropuesta: '14:00 PM',
      motivo: 'Cruce laboral imprevisto',
      estado: 'pendiente',
    },
  ]);

  // Computed signals
  readonly activeAppointmentsCount = computed(() => {
    return this.citas().filter((c) => c.estado === 'Confirmada' || c.estado === 'Pendiente de aprobación').length;
  });

  readonly pendingSpecializedAppointments = computed(() => {
    return this.citas().filter((c) => c.estado === 'Pendiente de aprobación');
  });

  readonly pendingReprogramaciones = computed(() => {
    return this.solicitudesReprog().filter((r) => r.estado === 'pendiente');
  });

  // Action methods
  switchUserRole(role: UserRole) {
    this.isAuthenticated.set(true);
    if (role === 'USER') {
      this.currentUser.set(this.userPaciente);
      this.showToast('Sesión cambiada', 'Accediendo como Paciente: Carlos Andrés Pérez', 'person');
    } else if (role === 'PROFESSIONAL') {
      this.currentUser.set(this.userDoctor);
      this.showToast('Sesión cambiada', 'Accediendo como Profesional: Dr. Camilo Restrepo', 'medical_services');
    } else {
      this.currentUser.set(this.userAdmin);
      this.showToast('Sesión cambiada', 'Accediendo como Administrador FCV', 'admin_panel_settings');
    }
  }

  showToast(title: string, message: string, icon = 'check_circle', type: 'success' | 'error' | 'info' = 'success') {
    this.toast.set({ show: true, title, message, icon, type });
    setTimeout(() => {
      this.toast.update((t) => ({ ...t, show: false }));
    }, 4500);
  }

  hideToast() {
    this.toast.update((t) => ({ ...t, show: false }));
  }

  // Agendar nueva cita (HU-017)
  agendarCita(data: {
    especialidad: string;
    profesionalNombre: string;
    sede: string;
    consultorio: string;
    fechaTexto: string;
    fechaIso: string;
    hora: string;
    duracionMinutos: number;
    tipo: 'general' | 'especializada';
  }) {
    const isGeneral = data.tipo === 'general';
    const status: AppointmentStatus = isGeneral ? 'Confirmada' : 'Pendiente de aprobación';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `#FCV-${randNum}`;

    const newCita: Cita = {
      id: 'cita-' + Date.now(),
      codigo: newCode,
      pacienteId: this.currentUser().id,
      pacienteNombre: this.currentUser().name,
      pacienteDoc: this.currentUser().documento,
      pacienteAvatar: this.currentUser().avatarText,
      especialidad: data.especialidad,
      tipo: data.tipo,
      profesionalNombre: data.profesionalNombre,
      profesionalSubtitulo: isGeneral ? 'Medicina General Ambulatoria' : 'Consulta Especializada',
      sede: data.sede,
      consultorio: data.consultorio,
      fechaTexto: data.fechaTexto,
      fechaIso: data.fechaIso,
      hora: data.hora,
      duracionMinutos: data.duracionMinutos,
      estado: status,
      trazabilidad: [
        {
          estado: 'Creada',
          fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
          actor: `USER (${this.currentUser().name})`,
          fuente: 'USER · Interfaz Web Paciente',
        },
        {
          estado: status,
          fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
          actor: isGeneral ? 'SYSTEM' : 'SYSTEM',
          fuente: isGeneral ? 'SYSTEM (Aprobación inmediata Medicina General)' : 'SYSTEM (En espera de validación administrativa)',
          isCurrent: true,
        },
      ],
    };

    this.citas.update((prev) => [newCita, ...prev]);

    this.showToast(
      '¡Cita agendada con éxito!',
      `Su radicado ${newCode} está registrado para ${data.fechaTexto} (${data.hora}).`,
      'verified'
    );
    return newCita;
  }

  // Marcar Asistencia en agenda del médico (HU-024)
  marcarAsistencia(citaId: string, estado: 'realizada' | 'inasistencia') {
    const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.citas.update((list) =>
      list.map((c) => {
        if (c.id === citaId) {
          const newStatus: AppointmentStatus = estado === 'realizada' ? 'Realizada' : 'No asistió';
          return {
            ...c,
            estado: newStatus,
            registroHoraConfirmado: `${timeStr} hrs`,
            observacionAsistencial:
              estado === 'realizada'
                ? `Realizada · Confirmada a las ${timeStr} hrs`
                : 'Inasistencia confirmada · Paciente no se presentó',
            trazabilidad: [
              ...c.trazabilidad,
              {
                estado: newStatus,
                fechaHora: `Hoy, ${timeStr} hrs`,
                actor: this.currentUser().name,
                fuente: 'Estación Asistencial Médica FCV',
                isCurrent: true,
              },
            ],
          };
        }
        return c;
      })
    );

    if (estado === 'realizada') {
      this.showToast('Asistencia confirmada', `Cita registrada como atendida a las ${timeStr} hrs.`, 'check_circle');
    } else {
      this.showToast('Inasistencia registrada', 'Cupo auditado y liberado en el sistema.', 'person_off', 'error');
    }
  }

  // Solicitud de Reprogramación del paciente (HU-020, HU-021)
  solicitarReprogramacion(citaId: string, fechaPropuesta: string, horaPropuesta: string, motivo: string) {
    const cita = this.citas().find((c) => c.id === citaId);
    if (!cita) return;

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newRep: SolicitudReprogramacion = {
      id: 'rep-' + Date.now(),
      codigo: `#REP-${randNum}`,
      citaId: cita.id,
      pacienteNombre: cita.pacienteNombre,
      pacienteDoc: cita.pacienteDoc,
      especialidad: cita.especialidad,
      profesional: cita.profesionalNombre,
      sede: cita.sede,
      consultorio: cita.consultorio,
      fechaActual: cita.fechaTexto,
      horaActual: cita.hora,
      fechaPropuesta,
      horaPropuesta,
      motivo: motivo || 'Solicitud de cambio de horario del paciente',
      estado: 'pendiente',
    };

    this.solicitudesReprog.update((prev) => [newRep, ...prev]);

    this.showToast(
      'Solicitud radicada',
      `Radicado ${newRep.codigo}. Su cita actual sigue confirmada hasta que administración decida.`,
      'update'
    );
  }

  // Aceptar o rechazar propuesta de cambio de la clínica (en cita-5)
  responderCambioPropuesto(citaId: string, aceptar: boolean) {
    this.citas.update((list) =>
      list.map((c) => {
        if (c.id === citaId && c.cambioPropuesto) {
          if (aceptar) {
            return {
              ...c,
              fechaTexto: c.cambioPropuesto.fechaTexto,
              hora: c.cambioPropuesto.horaTexto,
              cambioPropuesto: undefined,
              trazabilidad: [
                ...c.trazabilidad,
                {
                  estado: 'Confirmada (Reprogramada)',
                  fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
                  actor: 'USER (Carlos Andrés Pérez)',
                  fuente: 'USER · Confirmación de nueva fecha',
                  isCurrent: true,
                },
              ],
            };
          } else {
            return {
              ...c,
              cambioPropuesto: undefined,
            };
          }
        }
        return c;
      })
    );

    if (aceptar) {
      this.showToast('Nueva fecha aceptada', 'Su cita ha sido actualizada con el nuevo horario propuesto.', 'done_all');
    } else {
      this.showToast('Cambio rechazado', 'Se conserva la fecha y horario originalmente agendados.', 'info');
    }
  }

  // Cancelar cita (HU-019)
  cancelarCita(citaId: string) {
    this.citas.update((list) =>
      list.map((c) => {
        if (c.id === citaId) {
          return {
            ...c,
            estado: 'Cancelada' as AppointmentStatus,
            trazabilidad: [
              ...c.trazabilidad,
              {
                estado: 'Cancelada',
                fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
                actor: this.currentUser().name,
                fuente: 'Interfaz Paciente FCV',
                isCurrent: true,
              },
            ],
          };
        }
        return c;
      })
    );
    this.showToast('Cita cancelada', 'El cupo ha sido liberado exitosamente en el catálogo general.', 'cancel');
  }

  // Administrador: Aprobar Cita Especializada (HU-017)
  aprobarCitaEspecializada(citaId: string) {
    this.citas.update((list) =>
      list.map((c) => {
        if (c.id === citaId) {
          return {
            ...c,
            estado: 'Confirmada' as AppointmentStatus,
            trazabilidad: [
              ...c.trazabilidad,
              {
                estado: 'Confirmada',
                fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
                actor: 'ADMIN (Coordinación Docente)',
                fuente: 'ADMIN · Dictamen de pertinencia médica aprobado',
                isCurrent: true,
              },
            ],
          };
        }
        return c;
      })
    );
    this.showToast('Cita aprobada', 'Se ha emitido la confirmación oficial al paciente y al especialista.', 'check_circle');
  }

  // Administrador: Rechazar Cita Especializada (HU-017)
  rechazarCitaEspecializada(citaId: string, motivo: string) {
    this.citas.update((list) =>
      list.map((c) => {
        if (c.id === citaId) {
          return {
            ...c,
            estado: 'Rechazada' as AppointmentStatus,
            motivoRechazo: motivo,
            trazabilidad: [
              ...c.trazabilidad,
              {
                estado: 'Rechazada',
                fechaHora: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
                actor: 'ADMIN (Comité Asistencial)',
                fuente: 'ADMIN · Validación nominal',
                descripcion: motivo,
                isCurrent: true,
              },
            ],
          };
        }
        return c;
      })
    );
    this.showToast('Cita rechazada', 'Se registró el motivo institucional de rechazo y se liberó la franja.', 'cancel', 'error');
  }

  // Administrador: Conciliación de Reprogramación
  aprobarReprogramacion(repId: string) {
    const rep = this.solicitudesReprog().find((r) => r.id === repId);
    if (!rep) return;

    this.solicitudesReprog.update((list) =>
      list.map((r) => (r.id === repId ? { ...r, estado: 'aprobada' as const } : r))
    );

    this.showToast(
      'Reprogramación aprobada',
      `Solicitud ${rep.codigo} aprobada. Nueva franja ${rep.fechaPropuesta} ${rep.horaPropuesta} confirmada.`,
      'done_all'
    );
  }

  rechazarReprogramacion(repId: string) {
    const rep = this.solicitudesReprog().find((r) => r.id === repId);
    if (!rep) return;

    this.solicitudesReprog.update((list) =>
      list.map((r) => (r.id === repId ? { ...r, estado: 'rechazada' as const } : r))
    );

    this.showToast(
      'Reprogramación rechazada',
      `Solicitud ${rep.codigo} denegada. Se mantiene la franja anterior.`,
      'info'
    );
  }

  // Administrador: Crear nuevo profesional (HU-008)
  agregarProfesional(nuevo: {
    nombre: string;
    registroSintetico: string;
    especialidadPrincipal: string;
    duracionMin: number;
    sedes: string[];
  }) {
    const nextNum = this.profesionales().length + 101;
    const prof: ProfesionalSalud = {
      codigo: `PROF-${nextNum}`,
      nombre: nuevo.nombre,
      email: nuevo.nombre.toLowerCase().replace(/[^a-z]/g, '.') + '@fcv.edu.co',
      registroSintetico: nuevo.registroSintetico || `Reg. FCV-${Math.floor(10000 + Math.random() * 90000)}`,
      especialidadPrincipal: nuevo.especialidadPrincipal,
      duracionMin: nuevo.duracionMin,
      sedes: nuevo.sedes.length > 0 ? nuevo.sedes : ['Sede Norte'],
      estado: 'Activo',
      avatarColor: 'bg-primary text-on-primary',
    };

    this.profesionales.update((prev) => [...prev, prof]);
    this.showToast('Profesional registrado', `${prof.nombre} (${prof.codigo}) creado en estado Activo.`, 'person_add');
  }

  // Profesional: Publicar bloque de horarios
  publicarBloqueHorario(data: { fecha: string; horaInicio: string; horaFin: string; sede: string }) {
    this.showToast(
      'Bloque de disponibilidad publicado',
      `Horario habilitado para el ${data.fecha} de ${data.horaInicio} a ${data.horaFin} en ${data.sede}. Se generaron franjas de 30 min.`,
      'event_available'
    );
  }
}
