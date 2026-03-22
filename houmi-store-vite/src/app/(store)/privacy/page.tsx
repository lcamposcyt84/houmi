import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Política de Privacidad</h1>
        <p className="text-brand-text-muted mb-10">Tu privacidad es importante para nosotros. Aquí te explicamos cómo manejamos tu información.</p>
        <div className="prose prose-slate max-w-none space-y-6 text-brand-text-muted text-sm leading-relaxed">
          {[
            { title: "1. Información que recopilamos", body: "Recopilamos información que tú nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y datos de pago al crear una cuenta o realizar una compra." },
            { title: "2. Cómo usamos tu información", body: "Utilizamos tu información para procesar pedidos, enviarte confirmaciones de compra, mejorar nuestros servicios y, con tu consentimiento, enviarte comunicaciones de marketing." },
            { title: "3. Seguridad de los datos", body: "Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración." },
            { title: "4. Compartir información", body: "No vendemos ni alquilamos tu información personal a terceros. Podemos compartir datos con proveedores de servicios que nos ayudan a operar nuestra tienda, bajo estrictos acuerdos de confidencialidad." },
            { title: "5. Tus derechos", body: "Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para ejercer estos derechos, contáctanos en contacto@houmi.com." },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-brand-text mb-2">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
