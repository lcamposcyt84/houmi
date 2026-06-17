import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "Todos los productos", href: "/products" },
    { name: "Bicicletas", href: "/products?category=bicicletas" },
    { name: "Electrónicos", href: "/products?category=camaras" },
    { name: "Electrodomésticos", href: "/products?category=electrodomesticos" },
  ],
  support: [
    { name: "Contacto", href: "/contact" },
    { name: "Envíos", href: "/shipping" },
    { name: "Devoluciones", href: "/returns" },
    { name: "FAQ", href: "/faq" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary text-white">
      {/* Main footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 bg-white rounded-full p-1">
                <img
                  src="/brand/logo.png"
                  alt="Houmi"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold font-display">Houmi</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Tu tienda de confianza. Los mejores productos con los mejores precios. 
              Envíos a todo el país.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tienda</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-brand-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-brand-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@houmi.com"
                  className="flex items-center gap-2 text-white/80 hover:text-brand-accent transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  contacto@houmi.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+580000000000"
                  className="flex items-center gap-2 text-white/80 hover:text-brand-accent transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  +58 000 000 0000
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-white/80 text-sm">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  Venezuela
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} Houmi Store. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



