import { getDashboardSummary } from "./dashboard.service.js";

export async function handleDashboardSummary(req, res) {
  try {
    const tenantId = req.tenantId;

    const summary = await getDashboardSummary(tenantId);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
