export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    try {
      const userRoles = req.user.roles; // extracted from JWT

      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({ message: "No roles assigned to user" });
      }

      // userRoles = ["ADMIN", "DOCTOR", ...]
      const hasPermission = userRoles.some((r) => allowedRoles.includes(r));

      if (!hasPermission) {
        return res.status(403).json({
          message: "Access denied. You do not have permission.",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "RBAC check failed" });
    }
  };
}
