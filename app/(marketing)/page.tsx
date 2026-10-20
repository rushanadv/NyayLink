import { HeroSplit } from "@/components/marketing/hero-split";
import { SectionStubs } from "@/components/marketing/section-stubs";

export default function MarketingHomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 01: Hero Split (Dimension.dev inspired two-column layout) */}
      <section id="hero" className="w-full scroll-mt-24">
        <HeroSplit />
      </section>

      {/* 02-07: Structured sections stubs for Problem, Marketplace, AI Advisory, SaaS, Trust, CTA */}
      <SectionStubs />
    </div>
  );
}
