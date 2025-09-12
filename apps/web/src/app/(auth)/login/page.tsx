import { LoginForm } from './_components/login-form';
import { GoogleLoginButton } from './_components/google-login-button';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-gray-500">Sign in to continue to NailSalon</p>
        </div>

        {/* Email/Password Form */}
        <LoginForm />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <GoogleLoginButton />

        {/* Link to Register Page */}
        <div className="text-sm text-center text-gray-500">
          {"Don't have an account? "}
          <Link href="/register" className="font-medium text-pink-500 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
