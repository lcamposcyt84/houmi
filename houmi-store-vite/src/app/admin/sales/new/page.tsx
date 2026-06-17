import { useState, useEffect } from "react";
import { phpFetch } from "@/lib/php-client";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Search } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";

interface Product {
  id: string;
  code: string;
  name: string;
  pricing: {
    priceUsd: number;
  } | null;
  inventory: {
    stock: number;
  } | null;
}

interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  priceUsd: number;
}

export default function NewSalePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState(40);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          phpFetch("admin/products/get.php"),
          phpFetch("admin/settings/get.php"),
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

  const addItem = (product: Product) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: 1,
          priceUsd: product.pricing?.priceUsd || 0,
        },
      ]);
    }
    setSearchQuery("");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalUsd = items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);
  const totalVes = totalUsd * exchangeRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("El nombre del cliente es requerido");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un producto");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await phpFetch("admin/sales/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          customerAddress: customerAddress || null,
          totalUsd,
          totalVes,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            priceUsd: item.priceUsd,
            priceVes: item.priceUsd * exchangeRate,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear venta");
      }

      navigate("/admin/sales");
          } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear venta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/sales">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Nueva Venta</h1>
          <p className="text-brand-text-muted">Registrar una venta manual</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
                <Input
                  label="Teléfono"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+58 412 123 4567"
                />
                <Input
                  label="Dirección"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Dirección de entrega"
                />
              </div>
            </Card>

            {/* Products */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Productos</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
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
                        onClick={() => addItem(product)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-brand-text">
                            {product.name}
                          </p>
                          <p className="text-xs text-brand-text-muted">
                            {product.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-brand-text">
                            ${product.pricing?.priceUsd?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-xs text-brand-text-muted">
                            Stock: {product.inventory?.stock || 0}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items list */}
              {items.length === 0 ? (
                <div className="text-center py-8 text-brand-text-muted">
                  Busca y agrega productos a la venta
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
                        <p className="text-xs text-brand-text-muted">
                          {item.productCode} • ${item.priceUsd.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateItemQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateItemQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-medium text-brand-text">
                          ${(item.priceUsd * item.quantity).toFixed(2)}
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
                Registrar Venta
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
