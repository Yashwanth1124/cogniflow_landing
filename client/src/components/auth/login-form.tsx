import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLocation } from "wouter";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { loginMutation } = useAuth();
  const [_, setLocation] = useLocation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutation.mutate(
      {
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    // Mock Google login since we don't have actual OAuth integration
    setIsGoogleLoading(true);
    
    // Simulate logging in with demo account
    setTimeout(() => {
      loginMutation.mutate(
        {
          username: "demo",
          password: "password", // This would be handled by OAuth in a real implementation
        },
        {
          onSuccess: () => {
            setLocation("/dashboard");
          },
          onSettled: () => {
            setIsGoogleLoading(false);
          },
        }
      );
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="rememberMe"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
              fill="#4285F4"
            />
            <path
              d="M5.515 14.884l-2.897-2.131c-1.175 2.271-1.175 4.961 0 7.232l2.897-2.132c-.729-1.381-.729-2.989 0-4.369z"
              fill="#34A853"
            />
            <path
              d="M12.273 5.926c2.053 0 3.98.689 5.436 1.949l2.6-2.599C18.275 3.583 15.411 2.529 12.273 2.529a8.872 8.872 0 0 0-7.55 4.224l2.897 2.131c.714-2.112 2.7-3.637 5.009-3.637z"
              fill="#EA4335"
            />
            <path
              d="M12.273 20.354c-2.387 0-4.314-1.302-5.009-3.537l-2.897 2.131a8.975 8.975 0 0 0 7.906 4.76c2.959 0 5.78-.988 7.818-2.833l-2.731-2.112c-1.259.847-2.831 1.349-4.66 1.349"
              fill="#FBBC05"
            />
          </svg>
        )}
        {isGoogleLoading ? "Signing in with Google..." : "Sign in with Google"}
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <a href="#" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
