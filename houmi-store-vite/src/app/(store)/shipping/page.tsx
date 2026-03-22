import { Link } from "react-router-dom";
import { Truck, Clock, MapPin, ArrowLeft, Package } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Información de Envíos</h1>
        <p className="text-brand-text-muted mb-10">Conoce cómo hacemos llegar tus productos a cualquier parte de Venezuela.</p>
        <div className="space-y-6">
          {[
            { icon: Truck, title: "Envío a todo el país", desc: "Realizamos entregas a nivel nacional. Nos aseguramos de que tu pedido llegue sin importar en qué estado te encuentres." },
            { icon: Clock, title: "Tiempo de entrega", desc: "El tiempo estimado de entrega es de 2 a 5 días hábiles dependiendo de tu ubicación y disponibilidad del producto." },
            { icon: MapPin, title: "Cobertura", desc: "Cubrimos todas las principales ciudades de Venezuela. Contáctanos si tienes dudas sobre la cobertura en tu zona." },
            { icon: Package, title: "Estado del pedido", desc: "Una vez realizado tu pedido, recibirás un número de referencia para hacer seguimiento de tu compra." },
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
      </div>
    </div>
  );
}
