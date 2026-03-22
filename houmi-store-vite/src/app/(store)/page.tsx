import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, CreditCard, Headphones, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductCard } from "@/components/products";
import { phpFetch } from "@/lib/php-client";

const benefits = [
  {
    icon: Truck,
    title: "Envío a todo el país",
    description: "Entregamos en cualquier parte de Venezuela",
  },
  {
    icon: CreditCard,
    title: "Pagos flexibles",
    description: "Acepta USD y Bolívares. Múltiples métodos de pago",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Estamos aquí para ayudarte cuando lo necesites",
  },
  {
    icon: Shield,
    title: "Compra segura",
    description: "Tus datos y compras están protegidos",
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("get_products.php?limit=8")
      .then(res => res.json())
      .then(productsRes => {
        setFeaturedProducts(productsRes.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen" />;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-[#0F2444]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-16 md:py-24 lg:py-32">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display leading-tight animate-fade-in">
                Tu tienda de{" "}
                <span className="text-brand-accent">confianza</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 animate-slide-up">
                Encuentra los mejores productos al mejor precio. Bicicletas, 
                electrónicos, electrodomésticos y mucho más.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
                <Link to="/products">
                  <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Ver productos
                  </Button>
                </Link>
                <Link to="/products?category=bicicletas">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-brand-primary">
                    Explorar categorías
                  </Button>
                </Link>
              </div>
              
              {/* Quick stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 animate-slide-up">
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-brand-accent">500+</p>
                  <p className="text-sm text-white/70">Productos</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-brand-accent">24/7</p>
                  <p className="text-sm text-white/70">Soporte</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-brand-accent">100%</p>
                  <p className="text-sm text-white/70">Garantía</p>
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm p-8">
                  <img
                    src="/brand/logo.png"
                    alt="Houmi Store"
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L60 45.8C120 41.7 240 33.3 360 37.5C480 41.7 600 58.3 720 62.5C840 66.7 960 58.3 1080 50C1200 41.7 1320 33.3 1380 29.2L1440 25V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="var(--color-brand-surface, #f8fafc)"/>
          </svg>
        </div>
      </section>


      {/* Featured Products */}
      <section className="section bg-brand-surface">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text font-display">
                Productos destacados
              </h2>
              <p className="mt-2 text-brand-text-muted">
                Los más recientes y populares
              </p>
            </div>
            <Link to="/products" className="hidden md:block">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/products">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos los productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text font-display">
              ¿Por qué elegirnos?
            </h2>
            <p className="mt-3 text-brand-text-muted max-w-2xl mx-auto">
              Nos comprometemos a brindarte la mejor experiencia de compra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-900/20 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <benefit.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-text mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-brand-text-muted">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
            ¿Listo para comprar?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Explora nuestro catálogo completo y encuentra los mejores productos 
            a precios increíbles.
          </p>
          <div className="mt-8">
            <Link to="/products">
              <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explorar productos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
