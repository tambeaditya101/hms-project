import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function registerTenant(data) {
  const { name, address, contactEmail, contactPhone, licenseNumber } = data;

  // Check uniqueness of license
  const exists = await prisma.tenant.findUnique({
    where: { licenseNumber },
  });

  if (exists)
    throw new Error("A tenant with this license number already exists.");

  // Start transaction
  return await prisma.$transaction(async (tx) => {
    const tenantId = uuidv4();

    const tenant = await tx.tenant.create({
      data: {
        id: tenantId,
        name,
        address,
        contactEmail,
        contactPhone,
        licenseNumber,
      },
    });

    // Create admin user for tenant
    const adminPasswordPlain = "Admin@123";
    const passwordHash = await bcrypt.hash(adminPasswordPlain, 10);

    const adminUser = await tx.user.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        firstName: "Hospital",
        lastName: "Admin",
        email: contactEmail,
        phone: contactPhone || null,
        username: `admin_${tenantId.slice(0, 6)}`,
        passwordHash,
        department: "ADMINISTRATION",
        roles: ["ADMIN"],
        status: "ACTIVE",
      },
    });

    return { tenant, adminUser, adminPasswordPlain };
  });
}

export async function getTenantById(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error("Tenant not found");

  return tenant;
}
