import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo y descripcion */}
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">ADDJC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Asociacion Deportiva Departamental de Judo de Cochabamba
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Formando campeones desde 1985
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 font-semibold">Contacto</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Cochabamba, Bolivia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+591 4 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contacto@addjc.com</span>
              </li>
            </ul>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="mb-4 font-semibold">Enlaces Rapidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Competencias
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Noticias
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ADDJC. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
