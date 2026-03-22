import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-4">Términos y Condiciones</h1>
        <p className="text-brand-text-muted mb-10">Al usar nuestros servicios, aceptas los siguientes términos y condiciones.</p>
        <div className="space-y-6 text-brand-text-muted text-sm leading-relaxed">
          {[
            { title: "1. Uso del sitio", body: "Al acceder a Houmi Store, aceptas utilizarlo únicamente con fines legales y de manera que no infrinja los derechos de terceros ni restrinja el uso del sitio por parte de otros usuarios." },
            { title: "2. Productos y precios", body: "Nos reservamos el derecho de modificar los precios de los productos en cualquier momento. Los precios mostrados en el momento de la compra serán los precios vigentes para esa transacción." },
            { title: "3. Proceso de compra", body: "Al completar una compra, declaras que la información proporcionada es verdadera y que estás autorizado a usar el método de pago seleccionado." },
            { title: "4. Disponibilidad", body: "Todos los pedidos están sujetos a disponibilidad de stock. En caso de que un producto no esté disponible, te notificaremos y ofreceremos alternativas o el reembolso correspondiente." },
            { title: "5. Limitación de responsabilidad", body: "Houmi Store no será responsable de daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de nuestros productos o servicios." },
            { title: "6. Modificaciones", body: "Podemos actualizar estos términos en cualquier momento. Te recomendamos revisarlos periódicamente. El uso continuado del sitio constituye la aceptación de los términos modificados." },
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
