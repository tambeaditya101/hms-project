import { createUser, getUsers } from "./user.service.js";

export async function handleCreateUser(req, res) {
  try {
    const tenantId = req.tenantId;

    const { firstName, lastName, email, phone, department, roles } = req.body;

    const user = await createUser({
      tenantId,
      firstName,
      lastName,
      email,
      phone,
      department,
      roles,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetUsers(req, res) {
  try {
    const tenantId = req.tenantId;

    const users = await getUsers(tenantId);

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
