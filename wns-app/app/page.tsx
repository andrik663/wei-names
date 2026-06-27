import Navbar from "@/components/Navbar";
import SearchSection from "@/components/SearchSection";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <SearchSection />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
