import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { Spinner } from '@/components/ui/Spinner';

export function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="lg" className="text-accent" />
    </div>
  );
}

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const { refreshToken, accessToken, setAuth, clearAuth } = useAuthStore.getState();
      if (refreshToken && !accessToken) {
        try {
          // refresh() returns only access_token — use setTokens to preserve existing refreshToken
          const tokens = await authApi.refresh(refreshToken);
          const me = await authApi.getMe(tokens.access_token);
          // setAuth sets user + both tokens. We pass the stored refreshToken explicitly
          // so it doesn't get wiped (backend refresh response only returns access_token)
          setAuth(me, { ...tokens, refresh_token: tokens.refresh_token ?? refreshToken });
        } catch {
          clearAuth(); // refresh token expired or revoked
        }
      }
      setReady(true);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount — reading store state directly avoids stale closure

  if (!ready) return <FullScreenSpinner />;
  return <>{children}</>;
}
