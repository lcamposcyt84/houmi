import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Clock, Phone } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Devoluciones</h1>
        <p className="text-brand-text-muted mb-10">Tu satisfacción es lo más importante. Conoce nuestras políticas de devolución.</p>
        <div className="space-y-6">
          {[
            { icon: RefreshCw, title: "Política de devoluciones", desc: "Aceptamos devoluciones dentro de los 7 días hábiles posteriores a la recepción del producto, siempre que esté en su estado original y sin uso." },
            { icon: Clock, title: "Tiempo de procesamiento", desc: "Una vez recibido el producto devuelto, procesamos el reembolso o cambio en un plazo de 3 a 5 días hábiles." },
            { icon: Phone, title: "¿Cómo iniciar una devolución?", desc: "Contáctanos directamente por correo o teléfono con tu número de orden y te guiaremos en el proceso paso a paso." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-semibold text-brand-text mb-1">{item.title}</p>
                <p className="text-brand-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 rounded-xl bg-brand-primary/5 border border-brand-primary/20">
          <p className="text-sm text-brand-text-muted">¿Necesitas iniciar una devolución?{" "}
            <Link to="/contact" className="text-brand-primary font-semibold hover:underline">Contáctanos aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
