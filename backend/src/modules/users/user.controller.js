import {
  createUser,
  deleteUser,
  getDoctors,
  getUsers,
  updateUser,
} from "./user.service.js";

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

export async function handleUpdateUser(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await updateUser(id, data);

    res.json({
      message: "User updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function handleDeleteUser(req, res) {
  try {
    const { id } = req.params;

    await deleteUser(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function handleGetDoctors(req, res) {
  try {
    const tenantId = req.tenantId;

    const doctors = await getDoctors(tenantId);

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(400).json({ message: error.message });
  }
}
