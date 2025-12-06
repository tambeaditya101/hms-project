import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

export async function resetPassword(req, res) {
  try {
    const { userId, newPassword } = req.body;

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hash,
        mustResetPassword: false,
      },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to reset password" });
  }
}
