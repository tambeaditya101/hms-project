import { createPatient, getPatients } from "./patient.service.js";

export async function handleCreatePatient(req, res) {
  try {
    const tenantId = req.tenantId;
    const {
      firstName,
      lastName,
      dob,
      gender,
      bloodGroup,
      email,
      phone,
      address,
      emergencyContact,
      type,
      doctorId,
    } = req.body;

    const patient = await createPatient({
      tenantId,
      firstName,
      lastName,
      dob,
      gender,
      bloodGroup,
      email,
      phone,
      address,
      emergencyContact,
      type,
      doctorId,
    });

    res.status(201).json({
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetPatients(req, res) {
  try {
    const tenantId = req.tenantId;

    const filters = {
      search: req.query.search || "",
      type: req.query.type || "",
    };

    const patients = await getPatients(tenantId, filters);

    res.status(200).json({ patients });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
