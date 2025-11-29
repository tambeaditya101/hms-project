import prisma from "../../config/prisma.js";
import { v4 as uuid } from "uuid";

export async function createBill(data) {
  const { tenantId, patientId, items } = data;

  // Validate patient
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId },
  });
  if (!patient) throw new Error("Invalid patient");

  const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);

  const bill = await prisma.bill.create({
    data: {
      id: uuid(),
      tenantId,
      patientId,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      status: "UNPAID",

      items: {
        create: items.map((item) => ({
          id: uuid(),
          title: item.title,
          amount: item.amount,
        })),
      },
    },
    include: { items: true },
  });

  return bill;
}

export async function getBills(tenantId) {
  return prisma.bill.findMany({
    where: { tenantId },
    include: { items: true, patient: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPatientBills(tenantId, patientId) {
  return prisma.bill.findMany({
    where: { tenantId, patientId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function addPayment(tenantId, billId, amount) {
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const bill = await prisma.bill.findFirst({
    where: { id: billId, tenantId },
  });
  if (!bill) throw new Error("Bill not found");

  if (amount > bill.dueAmount) {
    throw new Error(
      `Payment exceeds the due amount. Remaining due is ${bill.dueAmount}.`
    );
  }

  const updatedPaid = bill.paidAmount + amount;
  const updatedDue = bill.totalAmount - updatedPaid;

  const status =
    updatedDue === 0 ? "PAID" : updatedPaid === 0 ? "UNPAID" : "PARTIAL";

  return prisma.bill.update({
    where: { id: billId },
    data: {
      paidAmount: updatedPaid,
      dueAmount: updatedDue,
      status,
    },
  });
}
