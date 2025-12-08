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

  if (loading)
    return (
      <div className="p-8 flex justify-center text-lg font-semibold">
        Loading dashboard…
      </div>
    );

  return (
    <div className="space-y-8 p-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          A quick summary of patients, doctors, appointments, and revenue.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Patients"
          value={summary?.totalPatients}
          icon={UsersIcon}
          gradient="from-blue-500/10 to-blue-600/10"
          borderColor="border-blue-300"
        />
        <StatCard
          title="Total Doctors"
          value={summary?.totalDoctors}
          icon={DoctorIcon}
          gradient="from-green-500/10 to-green-600/10"
          borderColor="border-green-300"
        />
        <StatCard
          title="Today's Appointments"
          value={summary?.todaysAppointments}
          icon={CalendarIcon}
          gradient="from-purple-500/10 to-purple-600/10"
          borderColor="border-purple-300"
        />
        <StatCard
          title="Pending Bills"
          value={summary?.pendingBills}
          icon={WarningIcon}
          gradient="from-orange-500/10 to-orange-600/10"
          borderColor="border-orange-300"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${summary?.totalRevenue}`}
          icon={MoneyIcon}
          gradient="from-emerald-500/10 to-emerald-600/10"
          borderColor="border-emerald-300"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient, borderColor }) {
  return (
    <div
      className={`relative p-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow hover:shadow-lg border ${borderColor}
                  transition-all duration-300 hover:-translate-y-1 hover:bg-white`}
    >
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} pointer-events-none`}
      />

      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white shadow-inner">
          <Icon className="w-7 h-7 text-gray-700" />
        </div>

        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-1">{value}</h2>
        </div>
      </div>
    </div>
  );
}

/* ------------------ ICONS (No Library Needed) ------------------ */

function UsersIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M16 14c2.21 0 4 1.79 4 4v2H4v-2c0-2.21 1.79-4 4-4m8-10a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function DoctorIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm6 8v-2c0-2.2-2.7-4-6-4s-6 1.8-6 4v2h12z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M8 2v3m8-3v3m-12 4h16M5 22h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v13a2 2 0 002 2z" />
    </svg>
  );
}

function WarningIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 9v4m0 4h.01M10.29 3.86l-9.18 16A2 2 0 002.82 23h18.36a2 2 0 001.71-3.14l-9.18-16a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function MoneyIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 8c-2.2 0-4 1.3-4 3s1.8 3 4 3 4 1.3 4 3-1.8 3-4 3m0-15v2m0 10v2m9-5h2M1 12h2m17.07 7.07l1.41 1.41M2.93 4.93l1.41 1.41m0 12.73l-1.41 1.41m15.56-15.56l1.41-1.41" />
    </svg>
  );
}
