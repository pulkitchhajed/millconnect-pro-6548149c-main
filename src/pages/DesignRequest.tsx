import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, ImageIcon, Loader2, Wand2, Package, Clock, IndianRupee, MessageSquare, CheckCircle2, XCircle, Layers } from "lucide-react";

const DesignRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [counterOpen, setCounterOpen] = useState<string | null>(null);
  const [counterValue, setCounterValue] = useState("");

  const fetchRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("design_requests" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching requests:", error);
    }
    setRequests(data || []);
    setFetching(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!user) return;
    if (!image) {
      toast.error("Please upload an image of your design");
      return;
    }

    setLoading(true);
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('design-request-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-request-images')
        .getPublicUrl(filePath);

      const formData = new FormData(form);
      const { error: insertError } = await supabase
        .from('design_requests' as any)
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          quantity: parseFloat(formData.get('quantity') as string),
          description: formData.get('description') as string,
        });

      if (insertError) throw insertError;

      toast.success("Design request submitted successfully!");
      setImage(null);
      setPreview(null);
      fetchRequests();
      // Stay on page but show success - user can switch to history tab
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: string, response: 'Accepted' | 'Rejected' | 'Countered', price?: number) => {
    const { error } = await supabase
      .from("design_requests" as any)
      .update({
        buyer_response: response,
        status: response === 'Countered' ? 'Countered' : 'Closed',
        counter_price: price || null
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update response");
    } else {
      toast.success(`Request ${response.toLowerCase()} successfully`);
      setCounterOpen(null);
      fetchRequests();
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Responded: "bg-blue-100 text-blue-700 border-blue-200",
    Accepted: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Countered: "bg-orange-100 text-orange-700 border-orange-200",
    Closed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight">APC Requests Studio</h1>
          <p className="mt-2 text-muted-foreground">Submit new fabric visions or track your ongoing negotiations.</p>
        </div>

        <Tabs defaultValue="new" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 p-1 bg-white border shadow-sm rounded-xl">
            <TabsTrigger value="new" className="rounded-lg font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white">New Request</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white">My History</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <form onSubmit={onSubmit} className="space-y-8 rounded-2xl border bg-white p-8 shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Design Image *</Label>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">"For any design kindly upload a picture"</p>
                </div>
                <div 
                  className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/5 transition-all hover:bg-muted/10 hover:border-orange-500/50 overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} onClick={() => document.getElementById('image-upload')?.click()} alt="Preview" className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-center w-full h-full flex flex-col items-center justify-center space-y-3" onClick={() => document.getElementById('image-upload')?.click()}>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Click to upload or take a photo</p>
                        <p className="text-xs text-muted-foreground italic">Camera and Gallery supported (PNG, JPG, WebP)</p>
                      </div>
                    </div>
                  )}
                  <input 
                    id="image-upload"
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-bold">Required Quantity (meters) *</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.1" required placeholder="e.g. 500" className="h-12 border-muted-foreground/20 focus-visible:ring-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Additional Details (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Tell us about the fabric type, feel, or any other specific requirements..." 
                  className="min-h-[120px] border-muted-foreground/20 focus-visible:ring-orange-500"
                />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-black bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Submitting...</> : "Submit APC Request"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history">
            {fetching ? (
              <div className="flex h-64 items-center justify-center font-bold text-muted-foreground animate-pulse">Scanning history...</div>
            ) : requests.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-12 text-center shadow-sm max-w-2xl mx-auto">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-muted/30" />
                </div>
                <h2 className="text-xl font-bold">No requests found</h2>
                <p className="text-muted-foreground mt-2">Start your collection by submitting your first design.</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {requests.map((req) => (
                  <div key={req.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex p-6 md:w-2/3 gap-6">
                        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-muted bg-slate-50 shadow-sm group cursor-pointer relative">
                           <img src={req.image_url} alt="Design" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <ImageIcon className="text-white h-6 w-6" />
                           </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline" className={`font-black uppercase tracking-tighter text-[10px] px-2.5 py-0.5 border-2 ${statusColors[req.status]}`}>{req.status}</Badge>
                          </div>
                          <p className="text-sm font-medium leading-relaxed line-clamp-2 text-foreground/80">
                            {req.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {req.quantity} meters</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(req.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t md:border-t-0 md:border-l bg-slate-50/30 p-6 md:w-1/3 flex flex-col justify-center">
                        {req.status === 'Pending' ? (
                          <div className="flex h-full flex-col items-center justify-center text-center space-y-3 p-4 border-2 border-dashed rounded-xl bg-white/50">
                            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                               <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Awaiting Feedback</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-tighter text-orange-500">Studio Response</p>

                            <div className="grid grid-cols-2 gap-2">
                              {req.admin_price && (
                                <div className="rounded-xl border bg-white p-2.5 shadow-sm">
                                  <p className="text-[8px] uppercase font-black text-muted-foreground/50 mb-0.5">Price/m</p>
                                  <p className="text-sm font-black text-orange-500">₹{req.admin_price}</p>
                                </div>
                              )}
                              {req.admin_weight && (
                                <div className="rounded-xl border bg-white p-2.5 shadow-sm">
                                  <p className="text-[8px] uppercase font-black text-muted-foreground/50 mb-0.5">Delivery</p>
                                  <p className="text-sm font-black text-slate-900">{req.admin_weight}d</p>
                                </div>
                              )}
                            </div>

                            {req.status === 'Responded' && (
                              <div className="flex flex-col gap-2 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold text-xs" onClick={() => handleResponse(req.id, 'Accepted')}>Accept Deal</Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 font-bold text-xs" onClick={() => handleResponse(req.id, 'Rejected')}>Decline</Button>
                                </div>
                                <Button size="sm" variant="ghost" className="text-orange-600 font-black uppercase text-[10px] tracking-widest bg-orange-50 hover:bg-orange-100 h-10 rounded-xl transition-all border border-orange-200" onClick={() => {
                                  setCounterOpen(req.id);
                                  setCounterValue(req.admin_price?.toString() || "");
                                }}>
                                  Suggest Counter Price
                                </Button>
                              </div>
                            )}

                            {counterOpen === req.id && (
                              <div className="space-y-3 pt-4 border-t mt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                  <Label className="text-[9px] uppercase font-black text-slate-400">Your Counter (₹/m)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      className="h-10 text-sm font-black border-orange-200 focus-visible:ring-orange-500"
                                      value={counterValue}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCounterValue(e.target.value)}
                                    />
                                    <Button className="h-10 px-4 font-bold bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/10" onClick={() => handleResponse(req.id, 'Countered', parseFloat(counterValue))}>
                                      Send
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {req.buyer_response && (
                              <div className="rounded-xl border-2 border-orange-100 bg-orange-50/30 p-3 text-center">
                                <p className="text-[8px] uppercase font-black text-orange-400 mb-0.5">My Decision</p>
                                <p className="text-xs font-black text-orange-600">{req.buyer_response === 'Countered' ? `Countered @ ₹${req.counter_price}` : req.buyer_response}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DesignRequest;
