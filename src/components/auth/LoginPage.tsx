import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "./AuthLayout";
import {
  ArrowRight,
  Github,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/services/auth/authService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the validation schema using zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

// Infer the type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await authService.login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });
      setFormSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Login failed:", error);
      setFormError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your account"
    >
      <div className="space-y-6">
        {formError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start gap-2 text-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-500/15 text-green-600 p-3 rounded-md flex items-start gap-2 text-sm animate-fade-in">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={errors.email ? "text-destructive" : ""}
            >
              Email
              {errors.email && (
                <span className="ml-1 text-xs">({errors.email.message})</span>
              )}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`h-12 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className={errors.password ? "text-destructive" : ""}
              >
                Password
                {errors.password && (
                  <span className="ml-1 text-xs">
                    ({errors.password.message})
                  </span>
                )}
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`h-12 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" {...register("remember")} />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" className="h-12">
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
