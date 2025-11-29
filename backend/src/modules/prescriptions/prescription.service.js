import prisma from "../../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

export async function createPrescription(data) {
  const { tenantId, doctorId, patientId, medicines, notes } = data;

  // Validate patient belongs to same tenant
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId },
  });

  if (!patient) {
    throw new Error("Invalid patient for this tenant");
  }

  const prescriptionUid = `RX-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;

  const prescription = await prisma.prescription.create({
    data: {
      id: uuidv4(),
      tenantId,
      doctorId,
      patientId,
      prescriptionUid,
      notes,

      // THE IMPORTANT PART
      medicines: {
        create: medicines.map((m) => ({
          medicineName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || "",
        })),
      },
    },

    include: {
      medicines: true,
    },
  });

  return prescription;
}

export async function getPrescriptionsByPatient(tenantId, patientId) {
  return prisma.prescription.findMany({
    where: {
      tenantId,
      patientId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      prescriptionUid: true,
      medicines: true,
      notes: true,
      createdAt: true,
      doctorId: true,
    },
  });
}
