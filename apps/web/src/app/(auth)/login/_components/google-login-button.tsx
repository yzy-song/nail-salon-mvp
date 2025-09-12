'use client';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const GoogleLoginButton = () => {
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the token to our backend
      const response = await api.post('/auth/firebase-login', { idToken });
      const { access_token } = response.data.data;
      setToken(access_token);

      // Get profile and set user
      const profileResponse = await api.get('/auth/profile');
      setUser(profileResponse.data.data);

      toast.success('Login Successful!');
      router.push('/');
    } catch (error: any) {
      toast.error('Firebase Login Failed', { description: error.message });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => {
        void handleGoogleLogin();
      }}
    >
      <img src="/google-color.svg" alt="Google" className="w-5 h-5" />
      Sign in with Google
    </Button>
  );
};
