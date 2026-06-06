"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard } from "lucide-react";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser, clearError } from "@/store/authSlice";
import { loginSchema, LoginFormValues } from "@/lib/schemas/auth";

import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Redirect once logged in
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const onSubmit = async (data: LoginFormValues) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      router.push("/dashboard");
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--color-card-bg)] p-8 shadow-sm">
      {/* Brand mark on mobile */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--tag-design)]">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <span className="font-semibold" style={{ color: "var(--color-heading)" }}>
          TaskFlow
        </span>
      </div>

      <CardHeading as="h1" className="text-xl font-semibold mb-1">
        Welcome back
      </CardHeading>
      <CardDesc className="mb-6">Sign in to your account to continue</CardDesc>

      {/* Server-side auth error */}
      {error && (
        <Alert
          type="error"
          message={error}
          onDismiss={() => dispatch(clearError())}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <InputField
          {...register("email")}
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={errors.email?.message}
        />

        <div className="space-y-1">
          <InputField
            {...register("password")}
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={errors.password?.message}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--tag-design)" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="mt-2 w-full"
          loading={loading}
          disabled={loading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: "var(--color-desc)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline"
          style={{ color: "var(--tag-design)" }}
        >
          Create one
        </Link>
      </p>

      {/* Dev hint */}
      <div
        className="mt-6 rounded-md border p-3 text-xs"
        style={{
          borderColor: "var(--color-date-border)",
          color: "var(--color-desc)",
          background: "var(--color-date-bg)",
        }}
      >
        <p className="font-medium mb-1" style={{ color: "var(--color-heading)" }}>
          Demo credentials
        </p>
        <p>Email: admin@gmail.com</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
}
