import jwt from 'jsonwebtoken';
import { getTenantById, registerTenant } from './tenant.service.js';

export async function handleRegisterTenant(req, res) {
  try {
    const {
      name,
      address,
      contactEmail,
      contactPhone,
      licenseNumber,
      adminPassword,
    } = req.body;

    // Required field validation
    if (!name || !contactEmail || !licenseNumber) {
      return res.status(400).json({
        message: 'Name, contact email and license number are required',
      });
    }

    // Password validation
    if (!adminPassword || adminPassword.length < 8) {
      return res.status(400).json({
        message: 'Admin password must be at least 8 characters',
      });
    }

    const { tenant, adminUser } = await registerTenant({
      name,
      address,
      contactEmail,
      contactPhone,
      licenseNumber,
      adminPassword,
    });

    // Issue JWT for auto-login
    const token = jwt.sign(
      {
        userId: adminUser.id,
        tenantId: tenant.id,
        roles: adminUser.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.status(201).json({
      message: 'Tenant registered successfully',
      token,
      user: {
        id: adminUser.id,
        tenantId: tenant.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        phone: adminUser.phone,
        roles: adminUser.roles,
        department: adminUser.department,
        status: adminUser.status,
        mustResetPassword: adminUser.mustResetPassword,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
      },
    });
  } catch (error) {
    console.error('Tenant registration error:', error);
    return res.status(400).json({ message: error.message });
  }
}

export async function handleGetTenant(req, res) {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required' });
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
