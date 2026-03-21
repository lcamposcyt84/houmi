"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

interface AvatarUploadProps {
  currentAvatar: string | null;
  initials: string;
}

export function AvatarUpload({ currentAvatar, initials }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate simple constraints
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona una imagen válida.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado pesada (Máx 2MB).");
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);

      const res = await phpFetch("auth/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await res.json();
      
      // Update local state instantly
      setLocalAvatar(data.url);
      
      // Refresh Next.js server components to sync state
      router.refresh();

    } catch (error) {
      console.error(error);
      alert("Hubo un error subiendo tu foto de perfil. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative group cursor-pointer inline-block shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
      />
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden relative"
      >
        {localAvatar ? (
          <Image 
            src={localAvatar} 
            alt="Avatar" 
            fill 
            className="object-cover"
          />
        ) : (
          <span className="text-3xl font-bold font-display text-white uppercase tracking-wider">
            {initials}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}
