// src/config/userConstants.js

// ---------------------- ROLES ----------------------
export const ROLES = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  PHARMACIST: "PHARMACIST",
  RECEPTIONIST: "RECEPTIONIST",
  ACCOUNTANT: "ACCOUNTANT",
};

export const ROLE_OPTIONS = Object.values(ROLES);

// ---------------------- DEPARTMENTS ----------------------
export const DEPARTMENTS = {
  CARDIOLOGY: "CARDIOLOGY",
  DERMATOLOGY: "DERMATOLOGY",
  ORTHOPEDICS: "ORTHOPEDICS",
  RADIOLOGY: "RADIOLOGY",
  NEUROLOGY: "NEUROLOGY",
  GENERAL_MEDICINE: "GENERAL_MEDICINE",
};

export const DEPARTMENT_OPTIONS = Object.values(DEPARTMENTS);

// ---------------------- USER STATUS ----------------------
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  LOCKED: "LOCKED",
};

export const STATUS_OPTIONS = Object.values(USER_STATUS);
