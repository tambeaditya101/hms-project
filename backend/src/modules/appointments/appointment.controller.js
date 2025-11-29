import {
  createAppointment,
  getAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "./appointment.service.js";

export async function handleCreateAppointment(req, res) {
  try {
    const tenantId = req.tenantId;

    const { patientId, doctorId, date, time, reason } = req.body;

    const appointment = await createAppointment({
      tenantId,
      patientId,
      doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetAppointments(req, res) {
  try {
    const tenantId = req.tenantId;

    const appointments = await getAppointments(tenantId);

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetDoctorAppointments(req, res) {
  try {
    const tenantId = req.tenantId;
    const { doctorId } = req.params;

    const appointments = await getDoctorAppointments(tenantId, doctorId);

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleUpdateAppointmentStatus(req, res) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateAppointmentStatus(tenantId, id, status);

    res.status(200).json({
      message: "Appointment status updated",
      appointment: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
