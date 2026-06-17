import { useState } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { phpFetch } from "@/lib/php-client";

interface ReviewModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (productId: string) => void;
}

export function ReviewModal({ productId, productName, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Por favor selecciona una calificación de estrellas.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Por favor escribe un comentario de al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await phpFetch("reviews/post.php", {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al enviar la reseña");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(productId);
        onClose();
        // Reset state
        setTimeout(() => {
          setSuccess(false);
          setRating(0);
          setTitle("");
          setComment("");
        }, 300);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={() => !loading && !success && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-hidden animate-slide-up">
        {/* Close Button */}
        {!loading && !success && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold font-display text-brand-text mb-2">¡Gracias por tu reseña!</h2>
            <p className="text-brand-text-muted">Tu calificación ha sido enviada y está pendiente de aprobación.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold font-display text-brand-text mb-1 pr-8">
              Calificar Producto
            </h2>
            <p className="text-brand-text-muted text-sm mb-6 truncate">{productName}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-sm font-semibold text-brand-text mb-3">¿Cuántas estrellas le das?</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-1">Título de tu reseña (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Excelente producto, muy recomendado" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-1">Tu experiencia completa <span className="text-red-500">*</span></label>
                  <textarea 
                    placeholder="Cuéntanos más sobre por qué elegiste esta calificación..." 
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || rating === 0}
                isLoading={loading}
              >
                Enviar calificación
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
