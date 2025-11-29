import {
  createBill,
  getBills,
  getPatientBills,
  addPayment,
} from "./billing.service.js";

export async function handleCreateBill(req, res) {
  try {
    const tenantId = req.tenantId;

    const bill = await createBill({ ...req.body, tenantId });

    res.status(201).json({ message: "Bill created successfully", bill });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetBills(req, res) {
  try {
    const tenantId = req.tenantId;
    const bills = await getBills(tenantId);

    res.json({ bills });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleGetPatientBills(req, res) {
  try {
    const tenantId = req.tenantId;
    const { patientId } = req.params;

    const bills = await getPatientBills(tenantId, patientId);

    res.json({ bills });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleAddPayment(req, res) {
  try {
    const tenantId = req.tenantId;
    const { billId } = req.params;
    const { amount } = req.body;

    const updatedBill = await addPayment(tenantId, billId, amount);

    res.json({ message: "Payment updated", bill: updatedBill });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
