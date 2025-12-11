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
import { ROLE } from "./rbac";
import AppointmentDetails from "../pages/appointments/AppointmentDetails";
import EditAppointment from "../pages/appointments/EditAppointment";

export const ROUTES = [
  {
    index: true,
    element: Dashboard,
    roles: [ROLE.ADMIN],
  },
  {
    path: "patients",
    element: PatientsList,
    roles: [ROLE.ADMIN, ROLE.DOCTOR, ROLE.NURSE, ROLE.RECEPTIONIST],
  },
  {
    path: "patients/create",
    element: CreatePatient,
    roles: [ROLE.ADMIN, ROLE.RECEPTIONIST],
  },
  {
    path: "patients/:id",
    element: PatientDetails,
    roles: [ROLE.ADMIN, ROLE.DOCTOR, ROLE.NURSE],
  },
  {
    path: "appointments",
    element: AppointmentsList,
    roles: [ROLE.ADMIN, ROLE.DOCTOR, ROLE.RECEPTIONIST],
  },
  {
    path: "appointments/create",
    element: CreateAppointment,
    roles: [ROLE.ADMIN, ROLE.RECEPTIONIST],
  },
  {
    path: "users",
    element: UsersList,
    roles: [ROLE.ADMIN],
  },
  {
    path: "users/create",
    element: CreateUser,
    roles: [ROLE.ADMIN],
  },
  {
    path: "users/:id",
    element: UserDetails,
    roles: [ROLE.ADMIN],
  },
  {
    path: "users/:id/edit",
    element: EditUser,
    roles: [ROLE.ADMIN],
  },
  {
    path: "reset-password",
    element: ResetPassword,
    roles: "ANY", // any logged-in user
  },
  {
    path: "appointments/:id",
    element: AppointmentDetails,
    roles: [ROLE.ADMIN, ROLE.RECEPTIONIST, ROLE.DOCTOR],
  },
  {
    path: "appointments/:id/edit",
    element: EditAppointment,
    roles: [ROLE.ADMIN, ROLE.RECEPTIONIST, ROLE.DOCTOR],
  },
];
