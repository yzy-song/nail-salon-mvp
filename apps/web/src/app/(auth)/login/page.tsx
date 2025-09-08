import { LoginForm } from './_components/login-form';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-gray-500">Sign in to continue to NailSalon</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;