import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, ShieldCheck, Lock, Building2, Phone } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/catalog";
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            company_name: companyName,
            buyer_name: buyerName,
            phone: phone,
          },
          emailRedirectTo: window.location.origin + redirect,
        },
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.success("Registration successful! Please check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>
      
      <main className="flex-1 container mx-auto flex items-center justify-center px-4 py-20 z-10 relative">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {/* Header Section */}
          <div className="text-center mb-10 space-y-3 relative">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-2 group transition-all duration-500 hover:scale-110 shadow-lg shadow-primary/5">
              <ShieldCheck className="h-8 w-8 text-primary transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
              Partner Portal
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Secure access to your textile supply chain
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/30 backdrop-blur-xl rounded-2xl border border-white/10 h-[60px] mb-8">
              <TabsTrigger 
                value="login" 
                className="rounded-xl font-bold text-xs tracking-[0.1em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 shadow-sm"
              >
                LOGIN
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-xl font-bold text-xs tracking-[0.1em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 shadow-sm"
              >
                SIGN UP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-500 ring-1 ring-white/10">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2.5 group">
                    <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Professional Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 group">
                    <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Secure Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 text-sm font-black tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:bg-primary/90 active:scale-95 uppercase" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        IDENTIFYING...
                      </span>
                    ) : (
                      "CONTINUE TO DASHBOARD"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 focus-visible:outline-none">
              <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-500 ring-1 ring-white/10">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-5">
                    <div className="space-y-2.5 group">
                      <Label htmlFor="signup-company" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Company Entity</Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                        <Input
                          id="signup-company"
                          placeholder="Legal Entity Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="pl-12 h-14 bg-background/50 border-white/10 rounded-2xl transition-all font-medium"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5 group">
                      <Label htmlFor="signup-buyer" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Authorized Official</Label>
                      <Input
                        id="signup-buyer"
                        placeholder="Personnel Name"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        required
                        className="h-14 bg-background/50 border-white/10 rounded-2xl transition-all px-6 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <Label htmlFor="signup-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Corporate Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background/50 border-white/10 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <Label htmlFor="signup-phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="pl-12 h-14 bg-background/50 border-white/10 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <Label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Secret</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-12 h-14 bg-background/50 border-white/10 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 text-sm font-black tracking-widest rounded-2xl shadow-xl mt-4 transition-all hover:translate-y-[-2px] uppercase" disabled={loading}>
                    {loading ? "INITIALIZING..." : "CREATE PARTNER ACCOUNT"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <div className="mt-12 text-center animate-in fade-in slide-in-from-top-4 delay-700">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.4em] leading-relaxed">
              Proprietary System of MillConnect Pro<br />
              <span className="font-bold text-foreground/40 mt-1.5 block tracking-widest">Enterprise Grade Security Enabled</span>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
