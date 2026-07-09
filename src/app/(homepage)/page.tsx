import { Hero } from "@/components/hero";
import { UseCases } from "@/components/use-cases";
import { Capabilities } from "@/components/capabilities";
import { HowItWorks } from "@/components/how-it-works";
import { Comparisons } from "@/components/comparisons";
import { GetStarted } from "@/components/get-started";

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <HowItWorks />
      <UseCases />
      <Comparisons />
      <GetStarted />
    </>
  );
}
