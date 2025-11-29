import {
  createPrescription,
  getPrescriptionsByPatient,
} from "./prescription.service.js";

export async function handleCreatePrescription(req, res) {
  try {
    const tenantId = req.tenantId;
    const doctorId = req.user.userId; // doctor creating the prescription

    const { patientId, medicines, notes } = req.body;

    const prescription = await createPrescription({
      tenantId,
      doctorId,
      patientId,
      medicines,
      notes,
    });

    res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetPatientPrescriptions(req, res) {
  try {
    const tenantId = req.tenantId;
    const { patientId } = req.params;

    const prescriptions = await getPrescriptionsByPatient(tenantId, patientId);

    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
