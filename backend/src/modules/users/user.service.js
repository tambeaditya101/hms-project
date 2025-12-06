import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { validateUserInput } from "./user.validation.js";

export async function createUser(data) {
  const { tenantId, firstName, lastName, email, phone, department, roles } =
    data;

  // Validate roles + department
  const validated = validateUserInput({ roles, department });

  // Check duplicate email in same tenant
  const exists = await prisma.user.findFirst({
    where: { email, tenantId },
  });

  if (exists) {
    throw new Error("User with this email already exists in this tenant");
  }

  // Generate random password (for hackathon)
  const tempPassword = "User@123";
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Auto-generate username: first.last.<random>
  const username = `${firstName.toLowerCase()}.${
    lastName?.toLowerCase() || "user"
  }_${Date.now()}`;

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      tenantId,
      firstName,
      lastName,
      email,
      phone,
      roles: validated.roles,
      department: validated.department,
      username,
      passwordHash,
    },
  });

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    username: user.username,
    roles: user.roles,
    tempPassword, // return temp password (useful for hackathon testing)
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
