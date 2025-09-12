'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await api.post('/auth/login', values);
      const { access_token } = response.data.data;

      setToken(access_token);

      const profileResponse = await api.get('/auth/profile');
      setUser(profileResponse.data.data);

      toast.success('Login Successful!', {
        description: `Welcome back, ${profileResponse.data.data.name || profileResponse.data.data.email}!`,
      });

      router.push('/');
    } catch (error: any) {
      toast.error('Login Failed', {
        description: error.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="submit"
        onClick={(e) => void form.handleSubmit(onSubmit)(e)}
        className="w-full py-3 text-lg font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-md"
      >
        Login
      </Button>
    </Form>
  );
}
