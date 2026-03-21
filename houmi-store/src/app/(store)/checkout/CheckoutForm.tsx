"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, CheckCircle, AlertCircle, MessageCircle, CreditCard, Smartphone, UserCircle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button, Input, Card } from "@/components/ui";
import { formatUSD, formatBs } from "@/lib/currency";
import { phpFetch } from "@/lib/php-client";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface CustomerSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, getTotalUsd, getTotalVes, getTotalItems, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState<CustomerSession | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<"debit" | "c2p" | "card" | null>(null);

  useEffect(() => {
    setMounted(true);
    // Detect logged-in customer and autofill
    phpFetch("auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.customer) {
          const c = data.customer;
          setCustomer(c);
          // Autofill form with customer data
          setFormData((prev) => ({
            ...prev,
            name: `${c.firstName} ${c.lastName}`.trim(),
            email: c.email || prev.email,
            phone: c.phone || prev.phone,
          }));
        }
      })
      .catch(() => {});
  }, []);


  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalUsd = getTotalUsd();
  const totalVes = getTotalVes();

  if (items.length === 0 && !isComplete) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 text-brand-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-brand-text mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-brand-text-muted mb-6">
          Agrega productos antes de continuar con el checkout
        </p>
        <Link href="/products">
          <Button variant="primary">Ver productos</Button>
        </Link>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ciudad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!paymentMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar los items del carrito para enviar
      const orderItems = items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.quantity,
        priceUsd: item.product.priceDisplay.usdRaw,
        priceVes: item.product.priceDisplay.vesRaw,
      }));

      // Enviar pedido a la API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: `${formData.address}, ${formData.city}`,
          items: orderItems,
          totalUsd,
          totalVes,
          notes: formData.notes,
          paymentMethod,
          ...(customer ? { customerId: customer.id } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      // Save order data to localStorage for payment page
      const orderData = {
        orderNumber: data.orderNumber,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productCode: item.product.code,
          quantity: item.quantity,
          priceUsd: item.product.priceDisplay.usdRaw,
          priceVes: item.product.priceDisplay.vesRaw,
        })),
        totalUsd,
        totalVes,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      };
      
      localStorage.setItem(`order_${data.orderNumber}`, JSON.stringify(orderData));
      
      // Redirect to payment page
      router.push(`/checkout/payment?order=${data.orderNumber}`);
      clearCart();
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error al procesar el pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    // Número de WhatsApp de la tienda
    const whatsappNumber = "584249480518";
    const whatsappMessage = encodeURIComponent(
      `¡Hola! Acabo de realizar un pedido en Houmi Store.\n\n` +
      `📦 Número de pedido: ${orderId}\n` +
      `👤 Nombre: ${formData.name}\n` +
      `📱 Teléfono: ${formData.phone}\n\n` +
      `Me gustaría coordinar el pago y envío. ¡Gracias!`
    );

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-fade-in">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4 animate-slide-up">
          ¡Pedido registrado!
        </h2>
        <p className="text-brand-text-muted mb-2 animate-slide-up animation-delay-100">
          Gracias por tu interés, {formData.name.split(" ")[0]}
        </p>
        <p className="text-lg font-semibold text-brand-primary mb-4 animate-slide-up animation-delay-200">
          Número de pedido: {orderId}
        </p>
        
        <Card className="text-left mb-6 animate-slide-up animation-delay-300">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 mb-1">
                  ¿Qué sigue ahora?
                </p>
                <p className="text-sm text-green-700">
                  Nos pondremos en contacto contigo pronto para coordinar el pago y envío. 
                  También puedes contactarnos directamente por WhatsApp para agilizar el proceso.
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-brand-text">Tus datos de contacto</h3>
            <div className="text-sm text-brand-text-muted space-y-1">
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Teléfono:</strong> {formData.phone}</p>
              <p><strong>Dirección:</strong> {formData.address}, {formData.city}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="accent" leftIcon={<MessageCircle className="w-5 h-5" />}>
              Contactar por WhatsApp
            </Button>
          </a>
          <Link href="/products">
            <Button variant="primary">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer session banner */}
            {customer && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <UserCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    Comprando como <span className="font-bold">{customer.firstName} {customer.lastName}</span>
                  </p>
                  <p className="text-xs text-green-600">{customer.email}</p>
                </div>
                <Link href="/account" className="text-xs text-green-700 underline shrink-0">Mi cuenta</Link>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-4">
                Información de contacto
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nombre completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Juan Pérez"
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="juan@email.com"
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+58 412 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-4">
                Dirección de envío
              </h2>
              <div className="space-y-4">
                <Input
                  label="Dirección"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Av. Principal, Edificio X, Apto 123"
                  required
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="Caracas"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-4">
                Método de pago
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("c2p")}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    paymentMethod === "c2p"
                      ? "border-[#F7C72C] bg-[#F7C72C]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className={`w-6 h-6 ${paymentMethod === "c2p" ? "text-[#F7C72C]" : "text-gray-400"}`} />
                    <div>
                      <p className="font-medium text-brand-text">Pago Móvil C2P</p>
                      <p className="text-sm text-brand-text-muted">Pago desde tu móvil</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("debit")}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    paymentMethod === "debit"
                      ? "border-[#F7C72C] bg-[#F7C72C]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "debit" ? "text-[#F7C72C]" : "text-gray-400"}`} />
                    <div>
                      <p className="font-medium text-brand-text">Débito Mercantil</p>
                      <p className="text-sm text-brand-text-muted">Tarjeta de débito</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    paymentMethod === "card"
                      ? "border-[#F7C72C] bg-[#F7C72C]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-[#F7C72C]" : "text-gray-400"}`} />
                    <div>
                      <p className="font-medium text-brand-text">Tarjeta de Crédito</p>
                      <p className="text-sm text-brand-text-muted">Visa o Mastercard</p>
                    </div>
                  </div>
                </button>
              </div>
              {paymentMethod && (
                <div className="mt-4 p-4 bg-[#F7C72C]/10 border border-[#F7C72C]/20 rounded-lg">
                  <p className="text-sm text-brand-text">
                    {paymentMethod === "c2p" && (
                      <>Serás redirigido a la página de pago para completar tu transacción con Pago Móvil C2P.</>
                    )}
                    {paymentMethod === "debit" && (
                      <>Serás redirigido a la página de pago para completar tu transacción con tarjeta de débito Mercantil.</>
                    )}
                    {paymentMethod === "card" && (
                      <>Serás redirigido a la página de pago para completar tu transacción con tarjeta de crédito.</>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-4">
                Notas adicionales (opcional)
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instrucciones especiales de entrega..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D] transition-colors"
              />
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {paymentMethod 
                  ? "Después de completar el pago, recibirás una confirmación automática."
                  : "Selecciona un método de pago para continuar. El pago se procesará de forma segura a través del Banco Mercantil."}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
              <Link href="/products" className="flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Seguir comprando
                </Button>
              </Link>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="flex-1"
                isLoading={isSubmitting}
              >
                Confirmar pedido
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-text mb-4">
              Resumen del pedido
            </h2>

            {/* Items */}
            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-brand-primary text-white text-xs font-bold rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-brand-text-muted">
                      {item.product.priceDisplay.usd} × {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">
                  Subtotal ({totalItems} items)
                </span>
                <span className="text-brand-text">{formatUSD(totalUsd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">Envío</span>
                <span className="text-brand-text">Por coordinar</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-brand-text">Total</span>
                <div className="text-right">
                  <p className="font-bold text-xl text-brand-primary">
                    {formatUSD(totalUsd)}
                  </p>
                  <p className="text-sm text-brand-text-muted">
                    {formatBs(totalVes)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

