'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
} from '@loomi/ui';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSignIn = async (data: SignInFormData) => {
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign in failed. Please try signing in.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <Card className="bg-white/20 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div>
              <CardTitle className="text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-caveat), cursive' }}>Dwello.</CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Property Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignInSubmit(onSignIn)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                      <AlertCircle className="h-4 w-4 text-white" />
                      <AlertTitle className="text-white">Error</AlertTitle>
                      <AlertDescription className="text-white">{error}</AlertDescription>
                    </Alert>
                  )}

                  <FieldSet>
                    <FieldGroup>
                      <Field data-invalid={!!signInErrors.email}>
                        <FieldLabel htmlFor="signin-email" className="text-white">Email address</FieldLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signin-email"
                            type="email"
                            autoComplete="email"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="you@example.com"
                            {...registerSignIn('email')}
                            aria-invalid={!!signInErrors.email}
                            disabled={loading}
                          />
                        </div>
                        <FieldError errors={signInErrors.email} className="text-white" />
                      </Field>

                      <Field data-invalid={!!signInErrors.password}>
                        <FieldLabel htmlFor="signin-password" className="text-white">Password</FieldLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signin-password"
                            type="password"
                            autoComplete="current-password"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Enter your password"
                            {...registerSignIn('password')}
                            aria-invalid={!!signInErrors.password}
                            disabled={loading}
                          />
                        </div>
                        <FieldError errors={signInErrors.password} className="text-white" />
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <Button
                    type="submit"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUpSubmit(onSignUp)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                      <AlertCircle className="h-4 w-4 text-white" />
                      <AlertTitle className="text-white">Error</AlertTitle>
                      <AlertDescription className="text-white">{error}</AlertDescription>
                    </Alert>
                  )}

                  <FieldSet>
                    <FieldLegend className="text-white">Create Account</FieldLegend>
                    <FieldDescription className="text-white">
                      Get started with your free account
                    </FieldDescription>
                    <FieldGroup>
                      <Field data-invalid={!!signUpErrors.name}>
                        <FieldLabel htmlFor="signup-name" className="text-white">Full Name</FieldLabel>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signup-name"
                            type="text"
                            autoComplete="name"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="John Doe"
                            {...registerSignUp('name')}
                            aria-invalid={!!signUpErrors.name}
                            disabled={loading}
                          />
                        </div>
                        <FieldError errors={signUpErrors.name} className="text-white" />
                      </Field>

                      <Field data-invalid={!!signUpErrors.email}>
                        <FieldLabel htmlFor="signup-email" className="text-white">Email address</FieldLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="you@example.com"
                            {...registerSignUp('email')}
                            aria-invalid={!!signUpErrors.email}
                            disabled={loading}
                          />
                        </div>
                        <FieldError errors={signUpErrors.email} className="text-white" />
                      </Field>

                      <Field data-invalid={!!signUpErrors.password}>
                        <FieldLabel htmlFor="signup-password" className="text-white">Password</FieldLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signup-password"
                            type="password"
                            autoComplete="new-password"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="At least 6 characters"
                            {...registerSignUp('password')}
                            aria-invalid={!!signUpErrors.password}
                            disabled={loading}
                          />
                        </div>
                        <FieldDescription className="text-white">
                          Must be at least 6 characters
                        </FieldDescription>
                        <FieldError errors={signUpErrors.password} className="text-white" />
                      </Field>

                      <Field data-invalid={!!signUpErrors.confirmPassword}>
                        <FieldLabel htmlFor="signup-confirm-password" className="text-white">Confirm Password</FieldLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            id="signup-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Confirm your password"
                            {...registerSignUp('confirmPassword')}
                            aria-invalid={!!signUpErrors.confirmPassword}
                            disabled={loading}
                          />
                        </div>
                        <FieldError errors={signUpErrors.confirmPassword} className="text-white" />
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <Button
                    type="submit"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-center text-white">
              Demo credentials: <span className="font-mono text-white">demo@dwello.com</span> / any password
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
