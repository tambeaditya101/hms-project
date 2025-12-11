// server/src/modules/appointments/appointment.service.js
import prisma from "../../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create appointment (unchanged logic except standardized variable names)
 */
export async function createAppointment(data) {
  const { tenantId, patientId, doctorId, date, time, reason } = data;

  const appointmentDate = new Date(date);
  const now = new Date();

  // --- 1) Reject past date ---
  const appointmentDateOnly = new Date(appointmentDate);
  appointmentDateOnly.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDateOnly < today) {
    throw new Error("Cannot book an appointment for a past date.");
  }

  // --- 2) Reject past time if date is today ---
  if (appointmentDateOnly.getTime() === today.getTime()) {
    if (!time) throw new Error("Time is required for today's appointment.");
    const [hh, mm] = time.split(":").map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hh, mm, 0, 0);

    if (appointmentTime < now) {
      throw new Error("Cannot book an appointment for a past time.");
    }
  }

  // Validate patient belongs to tenant
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId },
  });
  if (!patient) throw new Error("Invalid patient");

  // Validate doctor belongs to tenant
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, tenantId, roles: { has: "DOCTOR" } },
  });
  if (!doctor) throw new Error("Invalid doctor");

  // Check doctor conflict
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: appointmentDate,
      time,
      status: "SCHEDULED",
    },
  });

  if (conflict) {
    throw new Error("Doctor is unavailable for this time slot.");
  }

  // Create appointment
  return prisma.appointment.create({
    data: {
      id: uuidv4(),
      tenantId,
      patientId,
      doctorId,
      date: appointmentDate,
      time,
      reason,
      status: "SCHEDULED",
    },
  });
}

/**
 * Update appointment — full edit (ADMIN / RECEPTIONIST)
 * - Cannot update past appointments
 * - Validates patient/doctor belong to tenant
 * - Validates no conflict for doctor/time (excluding current appt)
 */
export async function updateAppointment(tenantId, id, data) {
  const { patientId, doctorId, date, time, reason } = data;

  // Fetch existing appointment
  const appt = await prisma.appointment.findFirst({
    where: { id, tenantId },
  });

  if (!appt) throw new Error("Appointment not found");

  // Do not allow editing past appointment (appointment datetime < now)
  const now = new Date();
  const apptDateTime = new Date(appt.date);
  if (appt.time) {
    const [ah, am] = appt.time.split(":").map(Number);
    apptDateTime.setHours(ah, am, 0, 0);
  }
  if (apptDateTime < now) {
    throw new Error("Cannot edit past appointments.");
  }

  // If new date/time provided, validate not in past
  if (date) {
    const newDate = new Date(date);
    const newDateOnly = new Date(newDate);
    newDateOnly.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDateOnly < today)
      throw new Error("Cannot set appointment to a past date.");

    // If setting to today, ensure time not past
    if (newDateOnly.getTime() === today.getTime() && time) {
      const [hh, mm] = time.split(":").map(Number);
      const appointmentTime = new Date();
      appointmentTime.setHours(hh, mm, 0, 0);
      if (appointmentTime < now)
        throw new Error("Cannot set appointment to a past time.");
    }
  }

  // Validate patient belongs to tenant (if changed)
  if (patientId && patientId !== appt.patientId) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new Error("Invalid patient");
  }

  // Validate doctor belongs to tenant (if changed)
  if (doctorId && doctorId !== appt.doctorId) {
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, tenantId, roles: { has: "DOCTOR" } },
    });
    if (!doctor) throw new Error("Invalid doctor");
  }

  // If doctor/date/time changed, check conflict (exclude current appt)
  const checkDoctorId = doctorId ?? appt.doctorId;
  const checkDate = date ? new Date(date) : appt.date;
  const checkTime = time ?? appt.time;

  if (!checkDoctorId || !checkDate || !checkTime) {
    // enough info to check conflict only if all present
  } else {
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: checkDoctorId,
        date: new Date(checkDate),
        time: checkTime,
        status: "SCHEDULED",
        NOT: { id },
      },
    });
    if (conflict) throw new Error("Doctor is unavailable for this time slot.");
  }

  // Perform update (only provided fields)
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      patientId: patientId ?? undefined,
      doctorId: doctorId ?? undefined,
      date: date ? new Date(date) : undefined,
      time: time ?? undefined,
      reason: reason ?? undefined,
    },
  });

  return updated;
}

/**
 * Update status (SCHEDULED / COMPLETED / CANCELLED)
 */
export async function updateAppointmentStatus(tenantId, id, status) {
  // basic validation
  const allowed = ["SCHEDULED", "COMPLETED", "CANCELLED"];
  if (!allowed.includes(status)) throw new Error("Invalid status");

  // Ensure appointment exists and belongs to tenant
  const appt = await prisma.appointment.findFirst({ where: { id, tenantId } });
  if (!appt) throw new Error("Appointment not found");

  // Business rules: e.g. cannot mark COMPLETED for a future appointment (optional)
  // You can keep it permissive or enforce additional checks here.

  return prisma.appointment.update({
    where: { id },
    data: { status },
  });
}

/**
 * Delete appointment (only future & scheduled)
 */
export async function deleteAppointment(tenantId, id) {
  const appt = await prisma.appointment.findFirst({
    where: { id, tenantId },
  });

  if (!appt) {
    throw new Error("Appointment not found");
  }

  // Only allow deleting FUTURE + SCHEDULED appointments
  const now = new Date();
  const apptDateTime = new Date(appt.date);

  // Add the stored time (HH:mm) to the appointment datetime
  if (appt.time) {
    const [hh, mm] = appt.time.split(":").map(Number);
    apptDateTime.setHours(hh, mm, 0, 0);
  }

  // If appointment datetime is in the past → cannot delete
  if (appt.status !== "SCHEDULED" || apptDateTime < now) {
    throw new Error("Cannot delete past or completed appointments.");
  }

  // Safe delete
  return prisma.appointment.delete({
    where: { id },
  });
}

/**
 * Read helpers
 */
export async function getAppointments(tenantId, filters) {
  const where = { tenantId };

  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.status) where.status = filters.status.toUpperCase();
  if (filters.date) where.date = new Date(filters.date);

  if (filters.today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  if (filters.upcoming) {
    where.date = { gte: new Date() };
  }

  return prisma.appointment.findMany({
    where,
    include: { patient: true, doctor: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

export async function getDoctorAppointments(tenantId, doctorId) {
  return prisma.appointment.findMany({
    where: { tenantId, doctorId },
    include: { patient: true },
    orderBy: { date: "asc" },
  });
}

export async function getAppointmentById(tenantId, id) {
  return prisma.appointment.findFirst({
    where: { id, tenantId },
    include: { patient: true, doctor: true },
  });
}
