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
    doctorId,
  } = data;

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
      type,
      doctorId, // <-- FIX: Now storing doctor assignment
    },
  });

  return patient;
}

export async function getPatients(tenantId, filters) {
  const { search, type } = filters;

  const where = { tenantId };

  // 🔍 SEARCH on name or patient UID
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { patientUid: { contains: search, mode: "insensitive" } },
    ];
  }

  // TYPE filter (OPD / IPD)
  if (type) where.type = type;

  return prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      patientUid: true,
      firstName: true,
      lastName: true,
      gender: true,
      phone: true,
      type: true,
      doctorId: true,
      createdAt: true,
      email: true,
      bloodGroup: true,
      dob: true,
      address: true,
      doctor: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}
