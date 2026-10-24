import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";

export default function LawyerDashboardLoading() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <AnimatedGavelLoader
        variant="section"
        message="Loading Advocate Chambers Portal..."
        submessage="Synchronizing cause list alerts, client consultations, and digital filings"
        className="max-w-xl mx-auto"
      />
    </div>
  );
}
