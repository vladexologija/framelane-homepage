import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
