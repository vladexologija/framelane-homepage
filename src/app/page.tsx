import { Hero } from "@/components/hero";
import { LogoWall } from "@/components/logo-wall";
import { Capabilities } from "@/components/capabilities";
import { ScaleBlock } from "@/components/scale-block";
import { UseCases } from "@/components/use-cases";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { CtaBanner } from "@/components/cta-banner";

export default function Home() {
  return (
    <>
      <Hero />
      <LogoWall />
      <Capabilities />
      <ScaleBlock />
      <UseCases />
      <Testimonials />
      <FAQ />
      <CtaBanner />
    </>
  );
}
