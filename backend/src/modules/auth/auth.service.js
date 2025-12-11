import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function loginUser(username, password) {
  // 1. Find user WITH tenant
  const user = await prisma.user.findFirst({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid username or password");
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  // 3. Create JWT
  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      username: user.username,
      roles: user.roles,
      department: user.department,
      status: user.status,
      mustResetPassword: user.mustResetPassword,
    },
  };
}
