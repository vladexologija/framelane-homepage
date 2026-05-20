import { Hero } from "@/components/hero";
import { UseCases } from "@/components/use-cases";
import { Capabilities } from "@/components/capabilities";
import { Comparisons } from "@/components/comparisons";
import { Workflows } from "@/components/workflows";
import { FAQ } from "@/components/faq";
import { GetStarted } from "@/components/get-started";

export default function Home() {
  return (
    <>
      <Hero />
      <UseCases />
      <Capabilities />
      <Comparisons />
      <GetStarted />
    </>
  );
}
