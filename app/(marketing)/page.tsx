import { HeroEditorial } from "@/components/marketing/hero-editorial";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CoreCapabilities } from "@/components/marketing/core-capabilities";
import { TrustCompliance } from "@/components/marketing/trust-compliance";
import { ClosingCta } from "@/components/marketing/closing-cta";

export default function MarketingHomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 01: Clear Asymmetric Hero Section */}
      <section id="hero" className="w-full scroll-mt-24">
        <HeroEditorial />
      </section>

      {/* 02: How NyayLink Works (3 Meaningful Stages) */}
      <HowItWorks />

      {/* 03: Core Capabilities (Organized into 3 Coherent Categories) */}
      <CoreCapabilities />

      {/* 04: Legal Ethics & Bar Council Rule 36 Compliance */}
      <TrustCompliance />

      {/* 05: Decisive Closing Action */}
      <ClosingCta />
    </div>
  );
}
