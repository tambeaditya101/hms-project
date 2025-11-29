import prisma from "../../config/prisma.js";

export async function getDashboardSummary(tenantId) {
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    opdPatients,
    ipdPatients,
    prescriptionsCount,
    todayNewPatients,
    todayPrescriptions,
  ] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),

    prisma.user.count({
      where: {
        tenantId,
        roles: { has: "DOCTOR" },
      },
    }),

    prisma.patient.count({ where: { tenantId } }),

    prisma.patient.count({
      where: {
        tenantId,
        type: "OPD",
      },
    }),

    prisma.patient.count({
      where: {
        tenantId,
        type: "IPD",
      },
    }),

    prisma.prescription.count({ where: { tenantId } }),

    prisma.patient.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),

    prisma.prescription.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalDoctors,
    totalPatients,
    opdPatients,
    ipdPatients,
    prescriptionsCount,
    todayNewPatients,
    todayPrescriptions,
  };
}
