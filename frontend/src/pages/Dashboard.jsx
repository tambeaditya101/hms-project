import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/dashboard";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Patients" value={summary.totalPatients} />
        <StatCard title="Total Doctors" value={summary.totalDoctors} />
        <StatCard
          title="Today's Appointments"
          value={summary.todaysAppointments}
        />
        <StatCard title="Pending Bills" value={summary.pendingBills} />
        <StatCard title="Total Revenue" value={`₹${summary.totalRevenue}`} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}
