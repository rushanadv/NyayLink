import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";

export default function ClientDashboardLoading() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <AnimatedGavelLoader
        variant="section"
        message="Loading Client Legal Workspace..."
        submessage="Securing escrow milestones, case documents, and advocate communications"
        className="max-w-xl mx-auto"
      />
    </div>
  );
}
