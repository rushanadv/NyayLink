import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";

export default function LawyersLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <AnimatedGavelLoader
        variant="section"
        message="Consulting Verified Bar Council Advocates Directory..."
        submessage="Filtering verified legal standing, courts of practice, and consultation availability"
        className="max-w-xl mx-auto"
      />
    </div>
  );
}
