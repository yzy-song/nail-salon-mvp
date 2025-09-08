import { RegisterForm } from './_components/register-form';

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-500">
            Join us and book your appointment today!
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;