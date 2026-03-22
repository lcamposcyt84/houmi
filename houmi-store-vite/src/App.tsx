import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import AdminLayout from './app/admin/layout'

// ==== STORE PAGES ====
const StoreHomePage = lazy(() => import('./app/(store)/page'))
const CategoriesPage = lazy(() => import('./app/(store)/categories/page'))
const ProductsPage = lazy(() => import('./app/(store)/products/page'))
const LoginPage = lazy(() => import('./app/(store)/login/page'))
const RegisterPage = lazy(() => import('./app/(store)/register/page'))
const CheckoutPage = lazy(() => import('./app/(store)/checkout/page'))
const CheckoutPaymentPage = lazy(() => import('./app/(store)/checkout/payment/page'))
const ProductDetailPage = lazy(() => import('./app/(store)/products/[slug]/page'))

// ==== INFO PAGES (Footer links) ====
const ContactPage = lazy(() => import('./app/(store)/contact/page'))
const ShippingPage = lazy(() => import('./app/(store)/shipping/page'))
const ReturnsPage = lazy(() => import('./app/(store)/returns/page'))
const FaqPage = lazy(() => import('./app/(store)/faq/page'))
const PrivacyPage = lazy(() => import('./app/(store)/privacy/page'))
const TermsPage = lazy(() => import('./app/(store)/terms/page'))

// ==== ACCOUNT PAGES ====
const AccountPage = lazy(() => import('./app/account/page'))
const AccountOrdersPage = lazy(() => import('./app/account/orders/page'))
const AccountWishlistPage = lazy(() => import('./app/account/wishlist/page'))

// ==== ADMIN PAGES ====
const AdminPage = lazy(() => import('./app/admin/page'))
const AdminLoginPage = lazy(() => import('./app/admin/login/page'))
const AdminDashboardPage = lazy(() => import('./app/admin/dashboard/page'))
const AdminProductsPage = lazy(() => import('./app/admin/products/page'))
const AdminProductEditPage = lazy(() => import('./app/admin/products/[id]/page'))
const AdminSalesPage = lazy(() => import('./app/admin/sales/page'))
const AdminSalesNewPage = lazy(() => import('./app/admin/sales/new/page'))
const AdminOrdersPage = lazy(() => import('./app/admin/orders/page'))
const AdminPurchasesPage = lazy(() => import('./app/admin/purchases/page'))
const AdminPurchasesNewPage = lazy(() => import('./app/admin/purchases/new/page'))
const AdminExpensesPage = lazy(() => import('./app/admin/expenses/page'))
const AdminExpensesNewPage = lazy(() => import('./app/admin/expenses/new/page'))
const AdminPaymentsPage = lazy(() => import('./app/admin/payments/page'))
const AdminSettingsPage = lazy(() => import('./app/admin/settings/page'))
const AdminImportPage = lazy(() => import('./app/admin/import/page'))
const AdminBulkPricingPage = lazy(() => import('./app/admin/bulk-pricing/page'))

const NotFoundPage = lazy(() => import('./app/not-found'))

// Layout for the public store
const StoreLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando...</div>}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === PUBLIC STORE ROUTES === */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<StoreHomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
          {/* Account Routes (Also use store layout) */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<AccountOrdersPage />} />
          <Route path="/account/wishlist" element={<AccountWishlistPage />} />
          {/* Info Pages (Footer links) */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* === ADMIN LOGIN === */}
        <Route path="/admin/login" element={
          <Suspense fallback={<div>Loading Admin Login...</div>}>
            <AdminLoginPage />
          </Suspense>
        } />

        {/* === ADMIN LAYOUT ROUTES === */}
        <Route path="/admin" element={
          <Suspense fallback={<div>Loading Admin...</div>}>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </Suspense>
        }>
          <Route index element={<AdminPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditPage />} />
          <Route path="products/:id" element={<AdminProductEditPage />} />
          <Route path="sales" element={<AdminSalesPage />} />
          <Route path="sales/new" element={<AdminSalesNewPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="purchases" element={<AdminPurchasesPage />} />
          <Route path="purchases/new" element={<AdminPurchasesNewPage />} />
          <Route path="expenses" element={<AdminExpensesPage />} />
          <Route path="expenses/new" element={<AdminExpensesNewPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="import" element={<AdminImportPage />} />
          <Route path="bulk-pricing" element={<AdminBulkPricingPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={
          <Suspense fallback={<div>Loading...</div>}>
             <NotFoundPage />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  )
}
