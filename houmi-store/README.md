# Houmi Store 🛒

E-commerce completo construido con Next.js 14, TypeScript, Tailwind CSS y Prisma.

## Características

### Tienda Pública
- 🏠 Página de inicio con hero, categorías y productos destacados
- 📦 Catálogo de productos con filtros y búsqueda
- 🛒 Carrito de compras persistente (localStorage)
- 💳 Checkout mock (sin pago real)
- 💰 Precios en USD y Bolívares (VES)
- 📱 Diseño responsive

### Panel de Administración
- 🔐 Autenticación segura con JWT
- 📊 Gestión de productos (stock, precios, estado)
- 📈 Actualización de precios en lote por porcentaje
- 💱 Configuración de tasa de cambio USD/VES
- ⚙️ Configuración general de la tienda

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Base de datos:** SQLite (Prisma ORM)
- **Autenticación:** JWT con jose
- **Estado:** Zustand (carrito)
- **Iconos:** Lucide React

## Requisitos Previos

- Node.js 18+
- npm o yarn

## Instalación

1. **Clonar/copiar el proyecto**

2. **Instalar dependencias:**
```bash
cd houmi-store
npm install
```

3. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz:
```env
# Database
DATABASE_URL="file:./dev.db"

# Admin credentials
ADMIN_EMAIL="admin@houmi.com"
ADMIN_PASSWORD="tu-contraseña-segura"

# JWT Secret
JWT_SECRET="genera-una-clave-secreta-aqui"

# Default exchange rate
DEFAULT_EXCHANGE_RATE="40.00"
```

4. **Importar imágenes (opcional):**
```bash
npm run import:images
```
Esto copiará las imágenes desde `C:\Users\USER\Desktop\Houmi\LISTO` a `public/products/`.

5. **Configurar base de datos:**
```bash
npx prisma db push
npm run db:seed
```

6. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

7. **Abrir en el navegador:**
- Tienda: http://localhost:3000
- Admin: http://localhost:3000/admin

## Estructura del Proyecto

```
houmi-store/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Script de seed
├── public/
│   ├── brand/             # Logo e iconos
│   └── products/          # Imágenes de productos
├── scripts/
│   └── import-images.ts   # Script de importación
├── src/
│   ├── app/
│   │   ├── (store)/       # Páginas públicas
│   │   ├── admin/         # Panel de administración
│   │   └── api/           # API Routes
│   ├── components/
│   │   ├── layout/        # Header, Footer, CartDrawer
│   │   ├── products/      # ProductCard, ProductGrid, etc.
│   │   └── ui/            # Button, Input, Card, etc.
│   ├── lib/               # Utilidades (db, auth, currency)
│   ├── store/             # Estado global (Zustand)
│   ├── theme/             # Colores de marca
│   └── types/             # TypeScript types
└── data/
    └── catalog.generated.json  # Catálogo generado
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run import:images` | Importa imágenes locales |
| `npm run db:push` | Sincroniza esquema con BD |
| `npm run db:seed` | Ejecuta seed de datos |
| `npm run setup` | Setup completo (import + db + seed) |

## Credenciales por Defecto

- **Email:** admin@houmi.com
- **Password:** houmi2024secure

⚠️ **Importante:** Cambia estas credenciales en producción.

## API Endpoints

### Públicos
- `GET /api/products` - Lista productos con filtros
- `GET /api/products/[slug]` - Detalle de producto
- `GET /api/settings` - Configuración pública

### Admin (requieren autenticación)
- `POST /api/admin/login` - Iniciar sesión
- `POST /api/admin/logout` - Cerrar sesión
- `GET/PUT /api/admin/products` - Gestión de productos
- `POST /api/admin/bulk-price` - Actualización masiva de precios
- `GET/PUT /api/admin/settings` - Configuración

## Conversión de Monedas

- El precio base siempre es en USD
- El precio en VES se calcula automáticamente: `priceVes = priceUsd * exchangeRate`
- Opcionalmente se puede establecer un precio VES manual por producto

## Migración a PostgreSQL

Para migrar de SQLite a PostgreSQL:

1. Cambia el provider en `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Actualiza `DATABASE_URL` en `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/houmi_store"
```

3. Ejecuta la migración:
```bash
npx prisma migrate dev
```

## Licencia

Proyecto privado - Houmi Store © 2024





