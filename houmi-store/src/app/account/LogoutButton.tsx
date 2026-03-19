"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/v1/auth/logout", {
        method: "POST",
      });
      // Force hard redirect to clear all contexts
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed", e);
      setLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={loggingOut}
      className={`w-full h-full bg-white rounded-[2rem] p-6 lg:p-8 flex items-center justify-center gap-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 group transition-all ${loggingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-red-50 transition-colors shrink-0">
        <LogOut className={`w-5 h-5 transition-colors ${loggingOut ? 'text-gray-400' : 'text-gray-500 group-hover:text-red-500'}`} />
      </div>
      <span className={`font-semibold transition-colors ${loggingOut ? 'text-gray-500' : 'text-gray-600 group-hover:text-red-600'}`}>
        {loggingOut ? "Cerrando..." : "Cerrar sesión"}
      </span>
    </button>
  );
}
