import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/imagen02.jpg"
        alt="Judo training background"
        fill
        priority
        className="object-cover brightness-50"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Asociacion Deportiva Departamental
          <br />
          de Judo de Cochabamba
        </h1>
        <p className="mb-8 text-xl md:text-2xl">
          Formando campeones desde 1985
        </p>
        <p className="mb-12 text-lg text-gray-200">
          Sistema integrado de planificacion y seguimiento deportivo
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-6">
          <Link href="/login">
            Iniciar Sesion
          </Link>
        </Button>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </section>
  );
}
