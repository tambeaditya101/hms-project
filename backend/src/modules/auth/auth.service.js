import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';

export async function loginUser(email, password) {
  // 1. Find user by email
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3. Create JWT
  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  return {
    token,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles,
      department: user.department,
      status: user.status,
      mustResetPassword: user.mustResetPassword,
    },
  };
}
