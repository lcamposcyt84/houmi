import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Contacto</h1>
        <p className="text-brand-text-muted mb-10">Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.</p>
        <div className="space-y-6">
          <a href="mailto:contacto@houmi.com" className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-text">Correo electrónico</p>
              <p className="text-brand-text-muted text-sm">contacto@houmi.com</p>
            </div>
          </a>
          <a href="tel:+580000000000" className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-text">Teléfono</p>
              <p className="text-brand-text-muted text-sm">+58 000 000 0000</p>
            </div>
          </a>
          <div className="flex items-center gap-4 p-5 rounded-xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-text">Ubicación</p>
              <p className="text-brand-text-muted text-sm">Venezuela</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
