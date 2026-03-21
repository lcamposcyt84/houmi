"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, UserCircle2, CheckCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { phpFetch } from "@/lib/php-client";

// Types matching the API response
interface ReviewCustomer {
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  customer: ReviewCustomer;
}

interface ProductReviewsProps {
  productId: string;
  isAuthenticated: boolean;
}

export function ProductReviews({ productId, isAuthenticated }: ProductReviewsProps) {
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await phpFetch(`reviews/get?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (e) {
      console.error("Error fetching reviews", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setSubmitError("Por favor completa el título y tu comentario.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await phpFetch("reviews/create", {
        method: "POST",
        body: JSON.stringify({ productId, rating, title, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(data.message || "Reseña enviada correctamente.");
        setIsWriting(false);
        setRating(5);
        setTitle("");
        setComment("");
        // We don't refetch immediately because it needs admin approval
      } else {
        setSubmitError(data.error || "Ocurrió un error al enviar la reseña.");
      }
    } catch (e) {
      setSubmitError("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (ratingValue: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`w-4 h-4 ${
          idx < ratingValue ? "text-amber-400 fill-amber-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-text flex items-center gap-2">
            Opiniones de Clientes
            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {totalReviews}
            </span>
          </h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-sm font-medium">{averageRating.toFixed(1)} de 5 estrellas</span>
            </div>
          )}
        </div>

        {!isWriting && (
          <button
            onClick={() => isAuthenticated ? setIsWriting(true) : router.push("/login")}
            className="btn-primary rounded-full px-6 py-2.5 flex items-center gap-2 group transition-all"
          >
            <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Escribir reseña
          </button>
        )}
      </div>

      {/* Review Form */}
      {isWriting && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4">Tu experiencia con el producto</h3>
          
          {submitSuccess ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {submitSuccess}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const value = idx + 1;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            value <= (hoverRating || rating)
                              ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la reseña</label>
                <input
                  type="text"
                  maxLength={100}
                  className="input w-full bg-white"
                  placeholder="Ej. Excelente calidad..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  className="input w-full bg-white resize-none"
                  placeholder="Cuéntanos más sobre qué te gustó o qué podría mejorar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {submitError && (
                <p className="text-red-500 text-sm font-medium">{submitError}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !comment.trim()}
                  className="btn-primary rounded-xl px-6 py-2"
                >
                  {isSubmitting ? "Enviando..." : "Publicar reseña"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Aún no hay reseñas</h3>
            <p className="text-gray-500 text-sm mb-4">Sé el primero en compartir tu opinión sobre este producto.</p>
            {!isWriting && (
              <button
                onClick={() => isAuthenticated ? setIsWriting(true) : router.push("/login")}
                className="text-brand-primary font-medium hover:underline"
              >
                Escribir la primera reseña
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {review.customer.avatar ? (
                    <img src={review.customer.avatar} alt={review.customer.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 text-brand-primary font-bold rounded-full flex items-center justify-center ring-2 ring-blue-100/50">
                      {review.customer.firstName.charAt(0)}{review.customer.lastName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {review.customer.firstName} {review.customer.lastName.charAt(0)}.
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex">{renderStars(review.rating)}</div>
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Compra verificada
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-gray-50/50 p-4 rounded-2xl">
                  {review.title && <h5 className="font-bold text-gray-800 mb-1">{review.title}</h5>}
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
