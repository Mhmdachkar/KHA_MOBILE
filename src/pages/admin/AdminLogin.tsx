import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { adminFetch, apiBase, setAdminToken, getAdminToken, siteUrl, adminLoginAbsoluteUrl } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getAdminToken()) {
      navigate((location.state as { from?: string })?.from || "/admin/products", { replace: true });
    }
  }, [navigate, location.state]);

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
        toast({ variant: "destructive", title: "Login failed", description: data.error || res.statusText });
        return;
      }
      setAdminToken(data.token);
      toast({ title: "Signed in" });
      navigate((location.state as { from?: string })?.from || "/admin/products", { replace: true });
    } catch {
      const base = apiBase();
      toast({
        variant: "destructive",
        title: "Cannot reach API",
        description: `Nothing is responding at ${base}. Open a terminal, run: cd server then npm run dev — keep it running while you use the admin.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/90 text-slate-50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">KHA Mobile Admin</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to manage catalog, prices, and media.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="text-xs text-slate-500 mt-4 space-y-2">
              <span className="block">
                <span className="text-slate-500">Storefront: </span>
                <a href={siteUrl()} className="text-primary underline-offset-2 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                  {siteUrl()}
                </a>
              </span>
              <span className="block">
                <span className="text-slate-500">Admin sign-in URL: </span>
                <a href={adminLoginAbsoluteUrl()} className="text-primary underline-offset-2 hover:underline break-all">
                  {adminLoginAbsoluteUrl()}
                </a>
              </span>
              <span className="block pt-1 border-t border-slate-800 mt-3">
                API: <code className="text-slate-400 break-all">{apiBase()}</code> — run <code className="text-slate-400">npm run dev</code> in <code className="text-slate-400">server/</code>.
                Set <code className="text-slate-400">VITE_SITE_URL</code> in <code className="text-slate-400">.env</code> to your live site (and add that origin to server <code className="text-slate-400">FRONTEND_ORIGIN</code>). Admin accounts: <code className="text-slate-400">sql/002_seed_admin.sql</code>.
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
