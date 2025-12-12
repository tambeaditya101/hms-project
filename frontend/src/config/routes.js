import Dashboard from "../pages/Dashboard";
import PatientsList from "../pages/patients/PatientsList";
import PatientDetails from "../pages/patients/PatientDetails";
import CreatePatient from "../pages/patients/CreatePatient";
import AppointmentsList from "../pages/appointments/AppointmentsList";
import CreateAppointment from "../pages/appointments/CreateAppointment";
import UsersList from "../pages/users/UsersList";
import CreateUser from "../pages/users/CreateUser";
import UserDetails from "../pages/users/UserDetails";
import EditUser from "../pages/users/EditUser";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";
import AppointmentDetails from "../pages/appointments/AppointmentDetails";
import EditAppointment from "../pages/appointments/EditAppointment";

import { ROLES } from "../components/users/userConstants";

export const ROUTES = [
  {
    index: true,
    element: Dashboard,
    roles: [
      ROLES.ADMIN,
      ROLES.ACCOUNTANT,
      ROLES.DOCTOR,
      ROLES.NURSE,
      ROLES.RECEPTIONIST,
      ROLES.PHARMACIST,
    ],
  },
  {
    path: "patients",
    element: PatientsList,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  {
    path: "patients/create",
    element: CreatePatient,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
  },
  {
    path: "patients/:id",
    element: PatientDetails,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  {
    path: "appointments",
    element: AppointmentsList,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  },
  {
    path: "appointments/create",
    element: CreateAppointment,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
  },
  {
    path: "users",
    element: UsersList,
    roles: [ROLES.ADMIN],
  },
  {
    path: "users/create",
    element: CreateUser,
    roles: [ROLES.ADMIN],
  },
  {
    path: "users/:id",
    element: UserDetails,
    roles: [ROLES.ADMIN],
  },
  {
    path: "users/:id/edit",
    element: EditUser,
    roles: [ROLES.ADMIN],
  },
  {
    path: "reset-password",
    element: ResetPassword,
    roles: ["ANY"], // allow all authenticated users
  },
  {
    path: "appointments/:id",
    element: AppointmentDetails,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
  },
  {
    path: "appointments/:id/edit",
    element: EditAppointment,
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
  },
];
