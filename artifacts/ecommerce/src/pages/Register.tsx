import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const registerMutation = useRegister();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await registerMutation.mutateAsync({ data });
      login(res.token, res.user);
      toast({ title: "Account created!", description: "Welcome to ShopNow." });
      setLocation("/");
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message || "An error occurred", 
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
            <h1 className="text-4xl font-display font-bold mb-3">Create an account</h1>
            <p className="text-muted-foreground text-lg">Sign up to start your premium shopping experience.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Full Name</label>
              <Input {...register("name")} icon={<UserIcon className="w-5 h-5" />} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
            </div>

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

            <Button type="submit" size="lg" className="w-full h-12 text-base rounded-xl mt-6" isLoading={registerMutation.isPending}>
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Sign in
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
              Join the future of retail.
            </h2>
            <p className="text-muted-foreground text-lg">Curated products, seamless checkout, and priority support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
