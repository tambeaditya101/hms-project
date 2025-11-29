export async function handleCreateUser(req, res) {
  try {
    const tenantId = req.tenantId; // comes from JWT
    const userId = req.user.userId; // logged-in user

    const { firstName, lastName, email, department, roles } = req.body;

    const newUser = await createUser({
      tenantId,
      firstName,
      lastName,
      email,
      department,
      roles,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
