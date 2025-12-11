import { registerTenant, getTenantById } from "./tenant.service.js";

export async function handleRegisterTenant(req, res) {
  try {
    const { name, address, contactEmail, contactPhone, licenseNumber } =
      req.body;

    // Required field validation
    if (!name || !contactEmail || !licenseNumber) {
      return res.status(400).json({
        message: "Name, contact email and license number are required",
      });
    }

    const { tenant, adminUser, adminPasswordPlain } = await registerTenant({
      name,
      address,
      contactEmail,
      contactPhone,
      licenseNumber,
    });

    return res.status(201).json({
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
        tempPassword: adminPasswordPlain, // Temporary password
      },
    });
  } catch (error) {
    console.error("Tenant registration error:", error);
    return res.status(400).json({ message: error.message });
  }
}

export async function handleGetTenant(req, res) {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    const tenant = await getTenantById(tenantId);

    return res.status(200).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        address: tenant.address,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        licenseNumber: tenant.licenseNumber,
        status: tenant.status,
        createdAt: tenant.createdAt,
      },
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}
