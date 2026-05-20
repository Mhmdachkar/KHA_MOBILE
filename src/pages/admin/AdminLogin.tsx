import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, Store } from "lucide-react";
import { adminFetch, setAdminToken, getAdminToken } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 bg-white/5 border-white/10 text-slate-50 placeholder:text-slate-500 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/40 pl-10";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string })?.from || "/admin";

  useEffect(() => {
    if (getAdminToken()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: data.error || "Check your email and password.",
        });
        return;
      }
      setAdminToken(data.token);
      toast({ title: "Welcome back" });
      navigate(redirectTo, { replace: true });
    } catch {
      toast({
        variant: "destructive",
        title: "Could not connect",
        description: "The admin service is unavailable. Try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center border-b border-white/5">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-slate-800 border border-white/10 flex items-center justify-center">
              <Store className="h-7 w-7 text-violet-200" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KHA Mobile</h1>
            <p className="text-sm text-slate-400 mt-1">Admin sign in</p>
          </div>

          <form onSubmit={onSubmit} className="px-6 py-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-11 font-semibold bg-violet-600 hover:bg-violet-500 text-white",
                "shadow-lg shadow-violet-900/30"
              )}
              disabled={submitting}
            >
              {submitting ? (
                "Signing in…"
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <p className="px-6 pb-6 text-center text-[11px] text-slate-500">
            Authorized staff only. Contact your store administrator if you need access.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
