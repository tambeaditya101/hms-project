const ALLOWED_ROLES = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACIST",
  "RECEPTIONIST",
  "ACCOUNTANT",
];

const ALLOWED_DEPARTMENTS = [
  "CARDIOLOGY",
  "DERMATOLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
  "RADIOLOGY",
  "NEUROLOGY",
  "GENERAL_MEDICINE",
  "EMERGENCY",
  "OPHTHALMOLOGY",
];

// Roles that MUST have a department
const DEPARTMENT_REQUIRED_ROLES = ["DOCTOR", "NURSE"];

export function validateUserInput({ roles, department }) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    throw new Error("User must have at least one role");
  }

  const normalizedRoles = roles.map((r) => r.toUpperCase());
  const invalidRoles = normalizedRoles.filter(
    (r) => !ALLOWED_ROLES.includes(r)
  );

  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
  }

  const normalizedDept = department ? department.toUpperCase() : null;

  // Check if any assigned role requires a department
  const requiresDept = normalizedRoles.some((role) =>
    DEPARTMENT_REQUIRED_ROLES.includes(role)
  );

  if (requiresDept) {
    if (!normalizedDept) {
      throw new Error(
        `Department is required when assigning roles: ${DEPARTMENT_REQUIRED_ROLES.join(
          ", "
        )}`
      );
    }

    if (!ALLOWED_DEPARTMENTS.includes(normalizedDept)) {
      throw new Error(`Invalid department: ${department}`);
    }
  }

  return {
    roles: normalizedRoles,
    department: normalizedDept,
  };
}
