import { useEffect } from 'react';
import { clearToken } from '@/lib/php-client';

export function useInactivityTimeout(timeoutMs = 1800000) { // 30 minutos por defecto
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleLogout = () => {
      // Clear token to close session securely
      clearToken();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("houmi_admin_token");
        localStorage.removeItem("houmi_admin_token");
        localStorage.removeItem("houmi_auth_token");
      }
      
      // If we are already on login, do nothing, otherwise redirect indicating expiration
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Only set timeout if user is actively logged in (we have a token)
      // Or just always have it running
      timeoutId = setTimeout(handleLogout, timeoutMs);
    };

    // Attach to basic user activity events
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [timeoutMs]);
}
