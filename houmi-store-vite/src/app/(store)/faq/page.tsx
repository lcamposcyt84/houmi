import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const faqs = [
  { q: "¿Cómo puedo realizar un pedido?", a: "Navega a nuestro catálogo, selecciona el producto que deseas, agrégalo al carrito y sigue los pasos del checkout para finalizar tu compra." },
  { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos pagos en USD y Bolívares. Puedes pagar con transferencia, pago móvil (C2P) y tarjetas de débito/crédito." },
  { q: "¿Cuánto tiempo tarda el envío?", a: "El tiempo de entrega es de 2 a 5 días hábiles dependiendo de tu ubicación en Venezuela." },
  { q: "¿Puedo devolver un producto?", a: "Sí, aceptamos devoluciones dentro de los 7 días hábiles posteriores a la recepción si el producto está en su estado original." },
  { q: "¿Cómo hago seguimiento de mi pedido?", a: "Al completar tu compra recibirás un número de referencia. Contáctanos con ese número para conocer el estado de tu pedido." },
  { q: "¿Los precios incluyen IVA?", a: "Los precios mostrados no incluyen IVA. El 16% de IVA se calcula y se muestra en el checkout antes de confirmar tu compra." },
];

export default function FaqPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Preguntas Frecuentes</h1>
        <p className="text-brand-text-muted mb-10">Resolvemos tus dudas más comunes sobre nuestros productos y servicios.</p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 hover:border-brand-primary/30 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-brand-text mb-2">{faq.q}</h3>
              <p className="text-brand-text-muted text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 rounded-xl bg-brand-primary text-white text-center">
          <p className="font-semibold mb-2">¿No encontraste lo que buscabas?</p>
          <Link to="/contact" className="text-brand-accent font-bold hover:underline">Contáctanos directamente</Link>
        </div>
      </div>
    </div>
  );
}
