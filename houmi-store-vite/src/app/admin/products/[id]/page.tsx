
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

interface Product {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  inventory: {
    stock: number;
  } | null;
  pricing: {
    priceUsd: number;
    priceVes: number | null;
    manualVes: boolean;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const params = useParams();
  const navigate = useNavigate();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [priceVes, setPriceVes] = useState("");
  const [manualVes, setManualVes] = useState(false);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/categories"),
        ]);

        if (!productRes.ok) {
          throw new Error("Producto no encontrado");
        }

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        setProduct(productData);
        setCategories(categoriesData);

        // Populate form
        setName(productData.name);
        setCode(productData.code);
        setDescription(productData.description || "");
        setCategoryId(productData.categoryId);
        setPriceUsd(productData.pricing?.priceUsd?.toString() || "0");
        setPriceVes(productData.pricing?.priceVes?.toString() || "");
        setManualVes(productData.pricing?.manualVes || false);
        setStock(productData.inventory?.stock?.toString() || "0");
        setIsActive(productData.isActive);
        setImages(productData.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [productId]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          description: description || null,
          categoryId,
          priceUsd: parseFloat(priceUsd) || 0,
          priceVes: manualVes ? parseFloat(priceVes) || null : null,
          manualVes,
          stock: parseInt(stock) || 0,
          isActive,
          images,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccess("Producto actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir imagen");
      }

      const data = await response.json();
      setImages([...images, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Producto no encontrado"}</p>
        <Link to="/admin/products">
          <Button variant="outline">Volver a productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-text">
              Editar Producto
            </h1>
            <p className="text-brand-text-muted">Código: {product.code}</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Guardar cambios
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Información básica</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                />
                <Input
                  label="Código"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SKU o código"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción detallada del producto..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-brand-text focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors duration-200"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Imágenes</h2>

            {/* Current images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                    <img src={img}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* Add image placeholder */}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Subir</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Add image by URL */}
            <div className="flex gap-2">
              <Input
                placeholder="URL de imagen (ej: /products/categoria/imagen.png)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleAddImage}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Agregar
              </Button>
            </div>
            <p className="text-xs text-brand-text-muted mt-2">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Puedes agregar imágenes por URL o subir desde tu computadora
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Estado</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-brand-text">Producto activo</span>
            </label>
            <p className="text-sm text-brand-text-muted mt-2">
              Los productos inactivos no se muestran en la tienda
            </p>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Precios</h2>
            <div className="space-y-4">
              <Input
                label="Precio USD ($)"
                type="number"
                step="0.01"
                min="0"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                placeholder="0.00"
              />

              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={manualVes}
                    onChange={(e) => setManualVes(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-brand-text">
                    Precio VES manual
                  </span>
                </label>
                <Input
                  label="Precio VES (Bs)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceVes}
                  onChange={(e) => setPriceVes(e.target.value)}
                  placeholder="Calculado automáticamente"
                  disabled={!manualVes}
                />
                {!manualVes && (
                  <p className="text-xs text-brand-text-muted mt-1">
                    Se calcula usando la tasa de cambio configurada
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Inventario</h2>
            <Input
              label="Stock disponible"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />
          </Card>

          {/* Danger zone */}
          <Card className="p-6 border-red-200">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Zona de peligro
            </h2>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                if (
                  confirm("¿Estás seguro de eliminar este producto?")
                ) {
                  // Delete logic here
                }
              }}
            >
              Eliminar producto
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
