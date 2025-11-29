import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function loginUser(email, password) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Password check
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Create JWT payload
  const payload = {
    userId: user.id,
    tenantId: user.tenantId,
    roles: user.roles, // array
  };

  // Sign token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Return user info + token
  return {
    token,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      username: user.username,
      roles: user.roles,
    },
  };
}
