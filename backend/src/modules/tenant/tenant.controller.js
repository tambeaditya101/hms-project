import { registerTenant } from "./tenant.service.js";

export async function handleRegisterTenant(req, res) {
  try {
    const { name, address, contactEmail, contactPhone, licenseNumber } =
      req.body;

    if (!name || !contactEmail || !licenseNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { tenant, adminUser, adminPasswordPlain } = await registerTenant({
      name,
      address,
      contactEmail,
      contactPhone,
      licenseNumber,
    });

    res.status(201).json({
      message: "Tenant registered successfully",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
      },
      adminUser: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        roles: adminUser.roles,
        tempPassword: adminPasswordPlain, // for hackathon only
      },
    });
  } catch (error) {
    console.error("Error in handleRegisterTenant:", error);
    res.status(500).json({ message: error.message });
  }
}
