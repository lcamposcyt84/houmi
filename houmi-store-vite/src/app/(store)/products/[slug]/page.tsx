import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { calculatePriceDisplay } from "@/lib/currency";
import { getStockStatus } from "@/lib/utils";
import { ProductGallery } from "@/components/products";
import { Badge } from "@/components/ui";
import { AddToCartButton } from "./AddToCartButton";
import { ProductReviews } from "./ProductReviews";
import { phpFetch } from "@/lib/php-client";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    phpFetch(`get_products.php?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const raw = data.products?.[0];
        if (!raw) { navigate("/not-found"); return; }
        setProduct(raw);
        setLoading(false);
      })
      .catch(() => { navigate("/not-found"); });
  }, [slug]);

  if (loading) return <div className="section mt-24"><div className="container-custom">Cargando producto...</div></div>;
  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="section mt-24">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brand-text-muted mb-8">
          <Link to="/" className="hover:text-brand-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-brand-primary transition-colors">
            Productos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to={`/products?category=${product.category.slug}`}
            className="hover:text-brand-primary transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-brand-text truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Category & Code */}
            <div className="flex items-center gap-3">
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-sm text-brand-primary font-medium hover:underline"
              >
                {product.category.name}
              </Link>
              <span className="text-brand-text-muted">•</span>
              <span className="text-sm text-brand-text-muted">
                Código: {product.code}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display">
              {product.name}
            </h1>

            {/* Stock status */}
            <div className="flex items-center gap-3">
              <Badge variant={product.stockStatus.variant} size="md">
                {product.stockStatus.label}
              </Badge>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-sm text-orange-600">
                  ¡Solo quedan {product.stock}!
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="p-6 rounded-xl bg-brand-surface border border-gray-200">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-brand-primary">
                  {product.priceDisplay.usd}
                </span>
              </div>
              <p className="mt-2 text-lg text-brand-text-muted">
                {product.priceDisplay.ves}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-brand-text mb-2">
                  Descripción
                </h2>
                <p className="text-brand-text-muted leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to cart */}
            <div className="pt-4">
              <AddToCartButton product={product} disabled={isOutOfStock} />
            </div>

            {/* Additional info */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-text-muted">Envío a todo el país</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-text-muted">Garantía incluida</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-text-muted">Pago en USD o Bolívares</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section at the bottom */}
        <ProductReviews productId={product.id} isAuthenticated={false} />
      </div>
    </div>
  );
}
