import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, Factory, Package, ArrowRight, ShieldCheck } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/catalog";
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up fields
  const [billingName, setBillingName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstNumber, setGstNumber] = useState("");


  useEffect(() => {
    if (pincode.length === 6) {
      const fetchPincodeDetails = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (data && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            // Only auto-fill if the fields are currently empty
            if (!city) setCity(postOffice.District);
            if (!state) setState(postOffice.State);
          }
        } catch (error) {
          console.error("Error fetching pincode:", error);
        }
      };
      fetchPincodeDetails();
    }
  }, [pincode, city, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(redirect);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: billingName,
              phone: phone,
            }
          },
        });

        if (signUpError) throw signUpError;

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setIsLogin(true);
          return;
        }

        // Update profile with additional signup fields
        if (data?.user?.id) {
          const fullAddress = [addressLine1, addressLine2, city, `${state} - ${pincode}`].filter(Boolean).join(", ");
          const { error: profileError } = await supabase.from("profiles").upsert({
            user_id: data.user.id,
            buyer_name: billingName || "",
            phone: phone || "",
            delivery_address: fullAddress,
            billing_name: billingName || "",
            gst_number: gstNumber || "",
          } as any);

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // We don't throw here to avoid failing the whole process if only profile update fails
            // but we should warn the user
            toast.warning("Account created, but profile details could not be saved. You can update them in your dashboard.");
          }
        }

        toast.success("Registration successful! Please check your email for a confirmation link.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full flex-col lg:flex-row bg-background">
      {/* ── LEFT PANEL (Branding/Image) ── */}
      <div className="hidden lg:flex w-full lg:w-[45%] bg-primary relative overflow-hidden flex-col justify-between p-12 text-primary-foreground shadow-2xl z-10">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Decorative Circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div
          className="relative z-10 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20">
            <Factory className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm">MillConnect</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mb-12 animate-in slide-in-from-left-8 duration-700 ease-out fade-in">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight mb-6 drop-shadow-sm">
            Direct access to premium textile mills.
          </h1>
          <p className="text-lg text-primary-foreground/80 font-medium max-w-sm leading-relaxed">
            Source fabrics faster, manage sample requests, and track your bulk orders—all from one platform.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4 text-primary-foreground/90 group">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <span className="font-medium text-lg">Live inventory & sample tracking</span>
            </div>
            <div className="flex items-center gap-4 text-primary-foreground/90 group">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-medium text-lg">Secure & verified B2B transactions</span>
            </div>
          </div>
        </div>

        {/* Trusted By / Meta */}
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-primary-foreground/60 border-t border-white/10 pt-6">
          <p>&copy; {new Date().getFullYear()} Hera Textiles. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-24 bg-card relative">
        {/* Mobile Header / Home Button */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12 z-50">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            &larr; Back to Home
          </Button>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-10 mt-12 w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Factory className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">MillConnect</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm xl:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both pt-8 lg:pt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-display text-4xl font-bold tracking-tight mb-3">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-base">
              {isLogin ? "Enter your details to sign in to your dashboard" : "Register to start sourcing quality fabrics today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ex. rahul@company.com"
                className="h-12 bg-muted/30 focus:bg-background transition-colors border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
              />
            </div>

            <div className="space-y-1.5 relative">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={6}
                placeholder="Enter your password"
                className="h-12 pr-10 bg-muted/30 focus:bg-background transition-colors border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[36px] text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Additional fields for Sign up */}
            {!isLogin && (
              <div className="pt-4 pb-2 animate-in fade-in slide-in-from-top-4 duration-500 ease-out space-y-5">
                <div className="relative border-t border-muted-foreground/20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Order Details
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingName" className="text-xs font-semibold text-foreground/80">Billing Name *</Label>
                    <Input id="billingName" value={billingName} onChange={(e) => setBillingName(e.target.value)} required className="h-11 bg-muted/30 border-muted-foreground/20" placeholder="Full name or company" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">Phone Number *</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-11 bg-muted/30 border-muted-foreground/20" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Default Delivery Address</Label>
                    <Label htmlFor="addressLine1" className="text-xs font-semibold text-foreground/80">Flat, House no., Building, Company *</Label>
                    <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required className="h-11 bg-muted/30 border-muted-foreground/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressLine2" className="text-xs font-semibold text-foreground/80">Area, Street, Sector, Village (Optional)</Label>
                    <Input id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="h-11 bg-muted/30 border-muted-foreground/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-foreground/80">Town/City *</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="h-11 bg-muted/30 border-muted-foreground/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-semibold text-foreground/80">PIN Code *</Label>
                      <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required pattern="^[1-9][0-9]{5}$" maxLength={6} className="h-11 bg-muted/30 border-muted-foreground/20" placeholder="6 digits" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-semibold text-foreground/80">State *</Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger className="h-11 bg-muted/30 border-muted-foreground/20">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px]">
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gstNumber" className="text-xs font-semibold text-foreground/80">GST Number</Label>
                  <Input id="gstNumber" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="h-11 bg-muted/30 border-muted-foreground/20" placeholder="Optional" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 mt-8 group relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? "Sign In to Account" : "Create Account"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center bg-muted/30 rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              {isLogin ? "New to MillConnect?" : "Already managing orders?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="font-bold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                {isLogin ? "Register now" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
