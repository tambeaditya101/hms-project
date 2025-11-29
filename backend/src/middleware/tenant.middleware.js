export function enforceTenantAccess(req, res, next) {
  if (!req.tenantId) {
    return res.status(400).json({ message: "Tenant context missing" });
  }
  next();
}
