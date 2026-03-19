"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui";

export function AdminHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Panel de Administración
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}





