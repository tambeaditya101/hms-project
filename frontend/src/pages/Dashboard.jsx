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
    <>
      <HospitalSVG />
      <div className="relative p-6 space-y-8 overflow-hidden">
        {/* SVG illustration (fixed, non-overlapping) */}

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            A quick summary of patients, doctors, appointments, and activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Patients"
            value={summary.totalPatients}
            icon={UsersIcon}
            gradient="from-blue-500/10 to-blue-600/10"
            borderColor="border-blue-300"
          />

          <StatCard
            title="OPD Patients"
            value={summary.opdPatients}
            icon={ClipboardIcon}
            gradient="from-purple-500/10 to-purple-600/10"
            borderColor="border-purple-300"
          />

          <StatCard
            title="IPD Patients"
            value={summary.ipdPatients}
            icon={BedIcon}
            gradient="from-red-500/10 to-red-600/10"
            borderColor="border-red-300"
          />

          <StatCard
            title="Total Doctors"
            value={summary.totalDoctors}
            icon={DoctorIcon}
            gradient="from-green-500/10 to-green-600/10"
            borderColor="border-green-300"
          />

          <StatCard
            title="Today's New Patients"
            value={summary.todayNewPatients}
            icon={CalendarIcon}
            gradient="from-yellow-500/10 to-yellow-600/10"
            borderColor="border-yellow-300"
          />

          <StatCard
            title="Today's Prescriptions"
            value={summary.todayPrescriptions}
            icon={ClipboardIcon}
            gradient="from-emerald-500/10 to-emerald-600/10"
            borderColor="border-emerald-300"
          />
        </div>
      </div>
    </>
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

/* ------------------ ICONS (SVG) ------------------ */

function UsersIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M16 14c2.2 0 4 1.8 4 4v2H4v-2c0-2.2 1.8-4 4-4m8-10a4 4 0 11-8 0 4 4 0 018 0z" />
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

function ClipboardIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M9 2h6v2H9zM5 6h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6z" />
    </svg>
  );
}

function BedIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M3 10h18v8H3zM7 10V7a2 2 0 012-2h6a2 2 0 012 2v3" />
    </svg>
  );
}

/* ------------------ Hospital Background SVG ------------------ */

function HospitalSVG() {
  return (
    <svg
      className="absolute bottom-6 right-6 w-72 opacity-15 pointer-events-none"
      viewBox="0 0 512 512"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="12"
    >
      <path d="M256 32l160 80v120c0 120-80 200-160 240-80-40-160-120-160-240V112z" />
      <path d="M216 200h80M256 160v80" strokeLinecap="round" />
    </svg>
  );
}
