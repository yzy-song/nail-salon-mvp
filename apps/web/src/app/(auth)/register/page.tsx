import { RegisterForm } from './_components/register-form';
import { GoogleLoginButton } from '../login/_components/google-login-button'; // Re-use the button
import Link from 'next/link';

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-500">Join us and book your appointment today!</p>
        </div>

        {/* Registration Form */}
        <RegisterForm />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <GoogleLoginButton />
        
        {/* Link to Login Page */}
        <div className="text-sm text-center text-gray-500">
          {'Already have an account? '}
          <Link href="/login" className="font-medium text-pink-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;