import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Search } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";

interface Product {
  id: string;
  code: string;
  name: string;
}

interface PurchaseItem {
  productId: string | null;
  productName: string;
  quantity: number;
  costUsd: number;
}

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState(40);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // New item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCost, setNewItemCost] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/settings"),
        ]);
        const productsData = await productsRes.json();
        const settingsData = await settingsRes.json();

        setProducts(productsData.products || []);
        setExchangeRate(settingsData.exchangeRateUsdToVes || 40);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addProductItem = (product: Product) => {
    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        costUsd: 0,
      },
    ]);
    setSearchQuery("");
  };

  const addCustomItem = () => {
    if (!newItemName.trim() || !newItemQuantity || !newItemCost) {
      return;
    }
    setItems([
      ...items,
      {
        productId: null,
        productName: newItemName,
        quantity: parseInt(newItemQuantity),
        costUsd: parseFloat(newItemCost),
      },
    ]);
    setNewItemName("");
    setNewItemQuantity("");
    setNewItemCost("");
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number | null) => {
    const newItems = [...items];
    const item = newItems[index];
    if (field === "quantity") {
      item.quantity = value as number;
    } else if (field === "costUsd") {
      item.costUsd = value as number;
    } else if (field === "productName") {
      item.productName = value as string;
    } else if (field === "productId") {
      item.productId = value as string | null;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalUsd = items.reduce(
    (sum, item) => sum + item.costUsd * item.quantity,
    0
  );
  const totalVes = totalUsd * exchangeRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      setError("El proveedor es requerido");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un producto");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier,
          description: description || null,
          totalUsd,
          totalVes,
          items,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear compra");
      }

      navigate("/admin/purchases");
          } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear compra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/purchases">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Nueva Compra</h1>
          <p className="text-brand-text-muted">
            Registrar compra de inventario
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Información del Proveedor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Proveedor *"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Nombre del proveedor"
                  required
                />
                <Input
                  label="Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nota o referencia"
                />
              </div>
            </Card>

            {/* Products */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Productos</h2>

              {/* Search existing product */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto existente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                {searchQuery && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProductItem(product)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <p className="font-medium text-brand-text">
                          {product.name}
                        </p>
                        <p className="text-xs text-brand-text-muted">
                          {product.code}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add custom item */}
              <div className="flex gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Nombre del producto"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Cant."
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-20"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Costo $"
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomItem}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Agregar
                </Button>
              </div>

              {/* Items list */}
              {items.length === 0 ? (
                <div className="text-center py-8 text-brand-text-muted">
                  Agrega productos a la compra
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-brand-text">
                          {item.productName}
                        </p>
                        {item.productId && (
                          <p className="text-xs text-brand-text-muted">
                            Producto existente
                          </p>
                        )}
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.costUsd}
                        onChange={(e) =>
                          updateItem(index, "costUsd", parseFloat(e.target.value) || 0)
                        }
                        className="w-28"
                        placeholder="$ c/u"
                      />
                      <div className="w-24 text-right">
                        <p className="font-medium text-brand-text">
                          ${(item.costUsd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-brand-text-muted">
                  <span>Productos</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-brand-text-muted">
                  <span>Unidades</span>
                  <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold text-brand-text">
                  <span>Total USD</span>
                  <span>${totalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary font-medium">
                  <span>Total VES</span>
                  <span>Bs {totalVes.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
                disabled={items.length === 0}
              >
                Registrar Compra
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
