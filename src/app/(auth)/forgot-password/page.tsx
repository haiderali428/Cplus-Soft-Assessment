"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard, MailCheck } from "lucide-react";

import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/schemas/auth";

import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setSentEmail(data.email);
    setSubmitted(true);
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

      {submitted ? (
        /* Success state */
        <div className="flex flex-col items-center py-4 text-center">
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--tag-design) 12%, transparent)" }}
          >
            <MailCheck size={28} style={{ color: "var(--tag-design)" }} />
          </div>

          <CardHeading as="h1" className="text-xl font-semibold mb-2">
            Check your inbox
          </CardHeading>
          <CardDesc className="mb-1">We sent a reset link to</CardDesc>
          <p
            className="mb-6 text-sm font-semibold break-all"
            style={{ color: "var(--color-heading)" }}
          >
            {sentEmail}
          </p>
          <CardDesc className="mb-8 max-w-xs">
            If you don&apos;t see it within a few minutes, check your spam folder.
          </CardDesc>

          <Link
            href="/login"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--tag-design)" }}
          >
            ← Back to sign in
          </Link>
        </div>
      ) : (
        /* Form state */
        <>
          <CardHeading as="h1" className="text-xl font-semibold mb-1">
            Forgot your password?
          </CardHeading>
          <CardDesc className="mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </CardDesc>

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

            <Button
              type="submit"
              variant="primary"
              className="mt-2 w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--color-desc)" }}>
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: "var(--tag-design)" }}
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
