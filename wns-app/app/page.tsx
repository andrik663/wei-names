import RealNavbar from "@/components/RealNavbar";
import RealSearchSection from "@/components/RealSearchSection";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <RealNavbar />
      <RealSearchSection />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
