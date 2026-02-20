import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProvidersSection from "../components/layout/ProvidersSection";

export default function ProvidersPage() {
  return (
    <div className="min-h-screen text-gray-100 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="images/DirectAidBackgroundImage.png"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-transparent to-slate-950" />
        <div className="absolute inset-0 bg-slate-950/20" />
      </section>
      <div className="relative z-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProvidersSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
