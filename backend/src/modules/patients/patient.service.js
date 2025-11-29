import prisma from "../../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export async function createPatient(data) {
  const {
    tenantId,
    firstName,
    lastName,
    dob,
    gender,
    bloodGroup,
    email,
    phone,
    address,
    emergencyContact,
    type,
  } = data;

  // Generate patient UID
  const patientUid = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const patient = await prisma.patient.create({
    data: {
      id: uuidv4(),
      tenantId,
      patientUid,
      firstName,
      lastName,
      dob: dob ? new Date(dob) : null,
      gender,
      bloodGroup,
      email,
      phone,
      address,
      emergencyContact,
      type, // OPD / IPD
    },
  });

  return patient;
}

export async function getPatients(tenantId) {
  return prisma.patient.findMany({
    where: { tenantId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      patientUid: true,
      firstName: true,
      lastName: true,
      gender: true,
      email: true,
      phone: true,
      type: true,
      doctorId: true,
      createdAt: true,
    },
  });
}
