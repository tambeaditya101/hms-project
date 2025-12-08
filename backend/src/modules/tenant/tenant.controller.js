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

import { getTenantById } from "./tenant.service.js";

export async function handleGetTenant(req, res) {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    const tenant = await getTenantById(tenantId);

    res.json({
      success: true,
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
    console.error("Error fetching tenant:", error);
    res.status(404).json({ message: error.message });
  }
}
