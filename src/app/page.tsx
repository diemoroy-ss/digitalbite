import Nav from '../components/landing/Nav';
import Hero from '../components/landing/Hero';
import BeforeAfter from '../components/landing/BeforeAfter';
import HowItWorks from '../components/landing/HowItWorks';
import DemoGallery from '../components/landing/DemoGallery';
import Stats from '../components/landing/Stats';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import MobileCTA from '../components/landing/MobileCTA';

export const metadata = {
  title: 'DigitalBite | Tu menú con look de agencia en segundos',
  description: 'Sin fotógrafo, sin esperas, sin presupuesto de agencia. IA que genera contenido gastronómico premium.',
  openGraph: {
    title: 'DigitalBite | Tu menú con look de agencia en segundos',
    description: 'Sube tu foto y generamos diseños que venden listos para Instagram o tu menú digital.',
    images: ['https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function LandingPage() {
  return (
    <div className="relative bg-background min-h-screen text-foreground selection:bg-primary/30 selection:text-primary">
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <HowItWorks />
        <DemoGallery />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileCTA />
    </div>
  );
}
