export default function ComingSoon({
  title = "Coming Soon",
  description = "This feature is under development.",
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white border rounded-2xl shadow-md">
      {/* Illustration */}
      <svg
        className="w-32 h-32 mb-4 opacity-70"
        viewBox="0 0 64 64"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
      >
        <circle cx="32" cy="32" r="30" strokeOpacity="0.4" />
        <path
          d="M20 40l8-16 8 16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="28" r="2" />
      </svg>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-sm">{description}</p>
    </div>
  );
}
