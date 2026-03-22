import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-blue-900/20">404</h1>
        <h2 className="text-2xl font-semibold text-brand-text mt-4">
          Página no encontrada
        </h2>
        <p className="text-brand-text-muted mt-2 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


