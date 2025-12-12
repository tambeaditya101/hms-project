import ComingSoon from "../../components/common/ComingSoon";

export default function PrescriptionsList() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prescriptions</h1>

      <ComingSoon
        title="Prescriptions Module"
        description="Prescription management will be added soon, including medicine tracking and doctor notes."
      />
    </div>
  );
}
