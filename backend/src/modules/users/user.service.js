import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { validateUserInput } from "./user.validation.js";

export async function createUser(data) {
  const { tenantId, firstName, lastName, email, phone, department, roles } =
    data;

  // Validate roles + department
  const validated = validateUserInput({ roles, department });

  // Check duplicate email
  const exists = await prisma.user.findFirst({
    where: { email, tenantId },
  });

  if (exists) {
    throw new Error("A user with this email already exists in this hospital");
  }

  // Auto-generate username
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digits
  const username = `${firstName.toLowerCase()}.${(
    lastName || "user"
  ).toLowerCase()}_${random}`;

  // Auto-generate temporary password
  const tempPassword = `Temp@${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      tenantId,
      firstName,
      lastName,
      email,
      phone,
      department: validated.department,
      roles: validated.roles,
      username,
      passwordHash,
      mustResetPassword: true, // ⬅ important
      status: "ACTIVE",
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    tempPassword, // frontend shows this once
  };
}

export async function getUsers(tenantId) {
  return prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      username: true,
      roles: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function getDoctors(tenantId) {
  const doctors = await prisma.user.findMany({
    where: {
      tenantId,
      roles: { has: "DOCTOR" }, // Array contains DOCTOR
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      username: true,
      createdAt: true,
    },
  });

  return doctors;
}
