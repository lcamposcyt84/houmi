import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary to-[#0F2444] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-display">
            Houmi Admin
          </h1>
          <p className="text-white/70 mt-2">
            Inicia sesión para administrar tu tienda
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
