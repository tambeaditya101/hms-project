const ALLOWED_ROLES = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACIST",
  "RECEPTIONIST",
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

export function validateUserInput({ roles, department }) {
  if (!roles || roles.length === 0) {
    throw new Error("User must have at least one role");
  }

  // Validate roles
  const normalizedRoles = roles.map((r) => r.toUpperCase());

  const invalidRoles = normalizedRoles.filter(
    (r) => !ALLOWED_ROLES.includes(r)
  );

  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
  }

  // Department mandatory for doctor & nurse
  if (normalizedRoles.includes("DOCTOR") || normalizedRoles.includes("NURSE")) {
    if (!department) {
      throw new Error("Department is required for DOCTOR or NURSE role");
    }

    const normalizedDept = department.toUpperCase();

    if (!ALLOWED_DEPARTMENTS.includes(normalizedDept)) {
      throw new Error(`Invalid department: ${department}`);
    }

    return {
      roles: normalizedRoles,
      department: normalizedDept,
    };
  }

  // Department optional for other roles
  return {
    roles: normalizedRoles,
    department: department ? department.toUpperCase() : null,
  };
}
