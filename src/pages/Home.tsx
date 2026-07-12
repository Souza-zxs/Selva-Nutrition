import Hero from "../components/Hero";
import Manifesto from "../components/Manifesto";
import Comparison from "../components/Comparison";
import ProductCatalog from "../components/ProductCatalog";
import TrustBadges from "../components/TrustBadges";
import Ecosystem from "../components/Ecosystem";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Comparison />
      <ProductCatalog />
      <TrustBadges />
      <Ecosystem />
    </main>
  );
}
