"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { UserCircle, Check, Lock, Mail, FlaskConical, Shield, ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else {
          setError(authError.message || "An unexpected error occurred.");
        }
        setLoading(false);
        return;
      }

      // Success
      router.push("/dashboard");
      router.refresh(); // Refresh to ensure layout gets new session
    } catch (err: any) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@aureonpharma.com");
    setPassword("AureonDemo@2026");
    setError(null);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-center items-center p-[16px] relative" style={{
      backgroundImage: 'radial-gradient(#c6c6cd 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <main className="w-full max-w-[440px] flex flex-col items-center z-10">
        
        {/* Header */}
        <div className="mb-[40px] text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary mb-[16px] shadow-sm">
            <FlaskConical size={28} />
          </div>
          <h1 className="text-headline-md text-primary mb-[4px]">Aureon Pharmaceuticals</h1>
          <p className="text-body-md text-on-surface-variant">Quality Document Control System (QDCS)</p>
        </div>
        
        {/* Login Box */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-[40px] shadow-sm">
          <h2 className="text-title-sm text-on-surface mb-[24px]">Sign In to Continue</h2>
          
          {error && (
            <div className="mb-[16px] p-[12px] bg-error-container text-error rounded border border-error flex items-start gap-[8px]">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <span className="text-body-sm">{error}</span>
            </div>
          )}
          
          <form className="space-y-[16px]" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-[4px]" htmlFor="email">Corporate Email</label>
              <div className={`relative flex items-center h-[36px] border ${error ? 'border-error' : 'border-outline-variant'} rounded bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-colors overflow-hidden`}>
                <Mail className="absolute left-[8px] text-on-surface-variant" size={18} />
                <input 
                  className="w-full h-full pl-[36px] pr-[8px] bg-transparent border-none focus:ring-0 text-body-sm text-on-surface placeholder-outline-variant outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="user@aureonpharma.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-[4px]" htmlFor="password">Password</label>
              <div className={`relative flex items-center h-[36px] border ${error ? 'border-error' : 'border-outline-variant'} rounded bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-colors overflow-hidden`}>
                <Lock className="absolute left-[8px] text-on-surface-variant" size={18} />
                <input 
                  className="w-full h-full pl-[36px] pr-[36px] bg-transparent border-none focus:ring-0 text-body-sm text-on-surface placeholder-outline-variant outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  className="absolute right-[8px] text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Options */}
            <div className="flex items-center justify-between pt-[4px]">
              <label className="flex items-center space-x-[8px] cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 border border-outline-variant rounded-sm group-hover:border-primary transition-colors bg-surface-container-lowest">
                  <input className="absolute w-0 h-0 opacity-0 peer" type="checkbox" disabled={loading} />
                  <Check className="text-on-primary hidden peer-checked:block absolute z-10" size={14} />
                  <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded-sm pointer-events-none transition-opacity"></div>
                </div>
                <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <a className="text-body-sm text-primary hover:underline underline-offset-2" href="#">Forgot password?</a>
            </div>
            
            {/* Submit */}
            <button 
              className="w-full h-[40px] bg-primary text-on-primary text-title-sm rounded flex items-center justify-center hover:bg-primary/90 transition-opacity mt-[24px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="mt-[24px] flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="mx-[16px] text-label-caps text-on-surface-variant">DEMO</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          
          <button 
            className="mt-[24px] w-full h-[40px] bg-secondary-container border border-outline-variant text-on-secondary-container text-body-sm font-semibold rounded flex items-center justify-center hover:bg-secondary-container/80 transition-colors shadow-sm disabled:opacity-50" 
            type="button"
            onClick={fillDemoCredentials}
            disabled={loading}
          >
            <UserCircle className="mr-[8px] text-on-secondary-container" size={18} />
            Demo Account
          </button>

          <div className="mt-[16px] flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="mx-[16px] text-label-caps text-on-surface-variant">OR</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          
          <button className="mt-[16px] w-full h-[40px] bg-surface-container-low border border-outline-variant text-on-surface text-body-sm rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm disabled:opacity-50" type="button" disabled={loading}>
            <Shield className="mr-[8px] text-on-surface-variant" size={18} />
            Sign in with Corporate ID
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-[40px] text-center flex flex-col items-center gap-[4px]">
          <div className="flex items-center gap-[4px] text-secondary">
            <ShieldCheck size={16} />
            <span className="text-label-caps">Certified Enterprise Security</span>
          </div>
          <p className="text-body-sm text-outline">Data Encryption Active • v2.4.1</p>
        </div>
        
      </main>
    </div>
  );
}
