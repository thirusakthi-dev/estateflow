"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppLogo } from "@/components/ui/brand/app-logo";
import { useToast } from "@/components/ui/toast";
import { useLogin } from "@/features/auth/auth.queries";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [year, setYear] = useState(2026);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const elements = gsap.utils.toArray<HTMLElement>(".login-entrance");

    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    });

    return () => ctx.revert();
  }, [reduceMotion]);

  async function onSubmit(values: LoginFormValues) {
    loginMutation.reset();

    try {
      await loginMutation.mutateAsync(values);

      toast.success({
        title: "Welcome back!",
        description: "You have signed in successfully.",
      });

      router.replace("/dashboard");
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error({
        title: "Sign in failed",
        description:
          apiError.response?.data?.message ??
          "Please check your credentials and try again.",
      });
    }
  }

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent px-4 py-8 text-foreground sm:px-6">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <section className="relative z-10 my-auto w-full max-w-md">
        {/* Brand */}
        <div className="login-entrance mb-7 text-center sm:mb-9">
          <div className="mb-4 flex justify-center">
            <AppLogo
              iconSize={27}
              iconClassName="size-14 rounded-2xl shadow-lg shadow-primary/15"
            />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">EstateFlow</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Real estate management, simplified.
          </p>
        </div>

        {/* Login form */}
        <div className="login-entrance rounded-2xl border border-border/80 bg-background/75 p-5 shadow-xl shadow-black/[0.04] backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Sign in to access your EstateFlow workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              autoFocus
              leftIcon={Mail}
              error={errors.email?.message}
              disabled={isLoading}
              {...register("email", {
                onChange: () => loginMutation.reset(),
              })}
            />

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
                <span className="ml-1 text-destructive" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  leftIcon={LockKeyhole}
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="pr-10"
                  {...register("password", {
                    onChange: () => loginMutation.reset(),
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-[22px] z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Forgot password?
                </button>
              </div> */}
            </div>

            <Button
              type="submit"
              block
              size="lg"
              loading={isLoading}
              loadingText="Signing in..."
              rightIcon={ArrowRight}
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="login-entrance mt-6 text-center text-xs text-muted-foreground">
          © {year} EstateFlow. All rights reserved.
        </p>
      </section>
    </main>
  );
}
