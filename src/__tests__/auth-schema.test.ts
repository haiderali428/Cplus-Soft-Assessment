import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/schemas/auth";

// loginSchema ─

describe("loginSchema", () => {
  it("passes with valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
      expect(result.error.issues[0].message).toBe("Enter a valid email address");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
      expect(result.error.issues[0].message).toBe("Password must be at least 8 characters");
    }
  });

  it("rejects when both fields are empty", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});

// registerSchema──────────────────────────────────────────────────────

describe("registerSchema", () => {
  const valid = {
    name:            "Jane Doe",
    email:           "jane@example.com",
    password:        "password123",
    confirmPassword: "password123",
    role:            "member" as const,
  };

  it("passes with all valid fields", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...valid, name: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(issue?.message).toBe("Passwords don't match");
    }
  });

  it("rejects an invalid role", () => {
    const result = registerSchema.safeParse({ ...valid, role: "superuser" });
    expect(result.success).toBe(false);
  });

  it("accepts 'admin' as a valid role", () => {
    expect(registerSchema.safeParse({ ...valid, role: "admin" }).success).toBe(true);
  });
});

// forgotPasswordSchema────────────────────────────────────────────────

describe("forgotPasswordSchema", () => {
  it("passes with a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "reset@example.com" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Enter a valid email address");
    }
  });

  it("rejects an empty string", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});
