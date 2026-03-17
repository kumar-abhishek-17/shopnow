import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const loginMutation = useLogin();
  const { login: authLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      authLogin(res.token, res.user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/");
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid email or password", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-display font-bold mb-3">Welcome back</h1>
            <p className="text-muted-foreground text-lg">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Email</label>
              <Input {...register("email")} icon={<Mail className="w-5 h-5" />} placeholder="name@example.com" />
              {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Password</label>
              <Input {...register("password")} type="password" icon={<Lock className="w-5 h-5" />} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive ml-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full h-12 text-base rounded-xl mt-4" isLoading={loginMutation.isPending}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-muted">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract design" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-24">
          <div className="max-w-md">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4 leading-tight">
              Discover the new standard of premium shopping.
            </h2>
            <p className="text-muted-foreground text-lg">Join our community to access exclusive products and personalized experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
