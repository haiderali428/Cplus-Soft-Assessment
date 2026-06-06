"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard } from "lucide-react";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser, clearError } from "@/store/authSlice";
import { registerSchema, RegisterFormValues } from "@/lib/schemas/auth";
import { UserRole } from "@/types";

import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "member" },
  });

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await dispatch(
      registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success(`Account created! Welcome, ${result.payload.user.name}!`);
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
        Create your account
      </CardHeading>
      <CardDesc className="mb-6">Get started with TaskFlow today</CardDesc>

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
          {...register("name")}
          type="text"
          label="Full name"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          error={errors.name?.message}
        />

        <InputField
          {...register("email")}
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={errors.email?.message}
        />

        <InputField
          {...register("password")}
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          error={errors.password?.message}
        />

        <InputField
          {...register("confirmPassword")}
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />

        <SelectField
          {...register("role")}
          label="Role"
          required
          options={ROLE_OPTIONS}
          error={errors.role?.message}
        />

        <Button
          type="submit"
          variant="primary"
          className="mt-2 w-full"
          loading={loading}
          disabled={loading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: "var(--color-desc)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: "var(--tag-design)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
