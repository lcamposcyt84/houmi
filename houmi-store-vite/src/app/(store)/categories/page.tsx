import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Grid, ArrowLeft } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("get_categories.php")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container-custom py-12 min-h-[70vh]">
      <div className="text-center mb-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a inicio
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-brand-text font-display flex items-center justify-center gap-3">
          <Grid className="w-8 h-8 md:w-10 md:h-10 text-brand-primary" />
          Categorías
        </h1>
        <p className="mt-4 text-brand-text-muted max-w-2xl mx-auto text-lg">
          Encuentra exactamente lo que buscas navegando por nuestras secciones principales.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {categories.map((category: any, index: number) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/5 to-blue-900/10 p-6 md:p-8 hover:from-brand-primary hover:to-blue-900/90 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative z-10">
                <h3 className="font-bold text-brand-text group-hover:text-white transition-colors text-lg md:text-xl">
                  {category.name}
                </h3>
                <p className="text-sm font-medium text-brand-text-muted group-hover:text-white/80 transition-colors mt-2">
                  {category.productCount ?? 0} {category.productCount === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-brand-primary group-hover:text-brand-accent transform group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
