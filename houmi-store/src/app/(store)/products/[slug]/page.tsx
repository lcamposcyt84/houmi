import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { calculatePriceDisplay } from "@/lib/currency";
import { getStockStatus } from "@/lib/utils";
import { getCustomerSession } from "@/lib/customer-auth";
import { ProductGallery } from "@/components/products";
import { Badge } from "@/components/ui";
import { AddToCartButton } from "./AddToCartButton";
import { ProductReviews } from "./ProductReviews";
import type { ProductWithPrices } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<ProductWithPrices | null> {
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        inventory: true,
        pricing: true,
      },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  if (!product) return null;

  const exchangeRate = settings?.exchangeRateUsdToVes || 40;
  const priceUsd = product.pricing?.priceUsd || 0;
  const stock = product.inventory?.stock || 0;
  const images = JSON.parse(product.images) as string[];

  return {
    ...product,
    images,
    priceDisplay: calculatePriceDisplay(
      priceUsd,
      exchangeRate,
      product.pricing?.priceVes,
      product.pricing?.manualVes
    ),
    stock,
    stockStatus: getStockStatus(stock),
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - ${product.category.name}`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - ${product.category.name}`,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const session = await getCustomerSession();

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="section mt-24">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brand-text-muted mb-8">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-brand-primary transition-colors">
            Productos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/products?category=${product.category.slug}`}
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
                href={`/products?category=${product.category.slug}`}
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
        <ProductReviews productId={product.id} isAuthenticated={!!session} />
      </div>
    </div>
  );
}


