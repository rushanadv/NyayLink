import { HeroEditorial } from "@/components/marketing/hero-editorial";
import { AudienceGateways } from "@/components/marketing/audience-gateways";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TwoAudiences } from "@/components/marketing/two-audiences";
import { TrustCompliance } from "@/components/marketing/trust-compliance";
import { ClosingCta } from "@/components/marketing/closing-cta";

export default function MarketingHomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 01: Bespoke Asymmetric Hero Section */}
      <section id="hero" className="w-full scroll-mt-24">
        <HeroEditorial />
      </section>

      {/* 02: Prominent Client & Advocate Entry Gateways */}
      <AudienceGateways />

      {/* 03: How NyayLink Works (3 Meaningful Stages) */}
      <HowItWorks />

      {/* 04: Two Audiences, One Platform */}
      <TwoAudiences />

      {/* 05: Legal Ethics, BCI Rule 36 & Momentum Ring */}
      <TrustCompliance />

      {/* 06: Decisive Closing Action */}
      <ClosingCta />
    </div>
  );
}
