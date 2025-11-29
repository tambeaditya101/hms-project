import prisma from "../../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export async function createAppointment(data) {
  const { tenantId, patientId, doctorId, date, time, reason } = data;

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

  // Check simple conflict: SAME doctor, SAME date, SAME time
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      time,
      status: "SCHEDULED", // ignore cancelled/completed
    },
  });

  if (conflict) {
    throw new Error("Doctor is unavailable for this time slot.");
  }

  // Everything OK — create appointment
  return prisma.appointment.create({
    data: {
      id: uuidv4(),
      tenantId,
      patientId,
      doctorId,
      date: new Date(date),
      time,
      reason,
      status: "SCHEDULED",
    },
  });
}

export async function getAppointments(tenantId) {
  return prisma.appointment.findMany({
    where: { tenantId },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { date: "asc" },
  });
}

export async function getDoctorAppointments(tenantId, doctorId) {
  return prisma.appointment.findMany({
    where: { tenantId, doctorId },
    include: {
      patient: true,
    },
    orderBy: { date: "asc" },
  });
}

export async function updateAppointmentStatus(tenantId, id, status) {
  return prisma.appointment.update({
    where: {
      id,
    },
    data: { status },
  });
}
