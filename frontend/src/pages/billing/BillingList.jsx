import ComingSoon from "../../components/common/ComingSoon";

export default function BillingList() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>

      <ComingSoon
        title="Billing System"
        description="Invoices, payments, and revenue reports are coming soon."
      />
    </div>
  );
}
