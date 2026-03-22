import { CheckoutForm } from "./CheckoutForm";


export default function CheckoutPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-8">
          Finalizar compra
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
