"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh(); // Refresh the router to update server components with new auth state
  };

  return (
    <>
      {/* Left Panel: Branding / Info */}
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] bg-primary flex-col justify-between p-[40px] text-on-primary">
        <div>
          <div className="flex items-center gap-[12px] mb-[24px]">
            <div className="w-8 h-8 rounded bg-on-primary text-primary flex items-center justify-center font-bold text-title-sm">
              A
            </div>
            <span className="text-headline-md font-semibold tracking-tight">
              Aureon Pharmaceuticals
            </span>
          </div>
          <h1 className="text-display-lg mt-[64px] max-w-xl leading-tight">
            Enterprise Quality Document Control System
          </h1>
          <p className="text-title-sm text-on-primary-container mt-[24px] max-w-lg font-normal leading-relaxed">
            Secure, compliant, and intelligent document lifecycle management. 
            Ensure audit readiness and regulatory alignment.
          </p>
        </div>
        
        <div className="flex items-center gap-[12px] text-on-primary-container">
          <Shield size={24} />
          <span className="text-body-sm">
            Protected by advanced tenant isolation and row-level security.
          </span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-[24px] sm:p-[40px] bg-surface-container-lowest">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden flex items-center gap-[12px] mb-[32px]">
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-title-sm">
              A
            </div>
            <span className="text-title-sm font-semibold text-primary">
              Aureon Pharma
            </span>
          </div>
          
          <h2 className="text-display-lg text-on-surface mb-[8px]">Sign in</h2>
          <p className="text-body-md text-on-surface-variant mb-[32px]">
            Welcome back. Please enter your credentials to access your workspace.
          </p>

          {error && (
            <div className="mb-[24px] p-[12px] bg-error-container text-on-error-container text-body-sm rounded-[4px] border border-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-[24px]">
            <FormField
              label="WORK EMAIL"
              name="email"
              type="email"
              placeholder="e.g. rahul.s@aureonpharma.com"
              required
            />
            
            <div className="space-y-[8px]">
              <div className="flex justify-between items-center">
                <label className="text-label-caps text-on-surface-variant">
                  PASSWORD
                </label>
                <a href="#" className="text-body-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                className="w-full h-[36px] px-[12px] bg-surface-container-lowest border border-outline-variant rounded-[4px] text-body-sm text-on-surface placeholder:text-outline transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-[40px]"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign in to Workspace"}
            </Button>
          </form>

          <div className="mt-[32px] text-center text-body-sm text-on-surface-variant">
            <p>
              By signing in, you agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
