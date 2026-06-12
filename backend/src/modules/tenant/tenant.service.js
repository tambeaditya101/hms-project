import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma.js';

export async function registerTenant(data) {
  const {
    name,
    address,
    contactEmail,
    contactPhone,
    licenseNumber,
    adminPassword,
  } = data;

  // Check uniqueness of license
  const exists = await prisma.tenant.findUnique({
    where: { licenseNumber },
  });

  if (exists)
    throw new Error('A tenant with this license number already exists.');

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

    // Create admin user with self-chosen password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = await tx.user.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        firstName: 'Hospital',
        lastName: 'Admin',
        email: contactEmail,
        phone: contactPhone || null,
        passwordHash,
        department: 'ADMINISTRATION',
        roles: ['ADMIN'],
        status: 'ACTIVE',
        mustResetPassword: false,
      },
    });

    return { tenant, adminUser };
  });
}

export async function getTenantById(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error('Tenant not found');

  return tenant;
}
