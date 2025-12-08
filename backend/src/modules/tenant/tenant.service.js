import prisma from "../../config/prisma.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function registerTenant(data) {
  const { name, address, contactEmail, contactPhone, licenseNumber } = data;

  // 1. Check license uniqueness
  const exists = await prisma.tenant.findUnique({
    where: { licenseNumber },
  });
  if (exists) throw new Error("License number already exists");

  // 2. Start a transaction: create tenant + admin user
  const result = await prisma.$transaction(async (tx) => {
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

    // 3. Create default hospital admin user
    const adminPasswordPlain = "Admin@123"; // you can return this in response or email it
    const passwordHash = await bcrypt.hash(adminPasswordPlain, 10);

    const username = `admin_${tenantId.slice(0, 8)}`;
    const adminEmail = contactEmail; // or admin@{hospital-domain}

    const adminUser = await tx.user.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        firstName: "Hospital",
        lastName: "Admin",
        email: adminEmail,
        phone: contactPhone || null,
        username,
        passwordHash,
        department: "ADMINISTRATION",
        status: "ACTIVE",
        roles: ["ADMIN"],
      },
    });

    return { tenant, adminUser, adminPasswordPlain };
  });

  return result;
}

export async function getTenantById(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error("Tenant not found");

  return tenant;
}
