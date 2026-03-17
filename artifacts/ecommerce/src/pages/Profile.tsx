import { useAuth } from "@/contexts/AuthContext";
import { useGetOrders, useUpdateUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, User as UserIcon, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout, updateUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || "", address: user?.address || "", phone: user?.phone || "" });
  
  const updateMutation = useUpdateUser();
  const { data: ordersData, isLoading: ordersLoading } = useGetOrders({}, { query: { enabled: !!user } });

  if (!isAuthenticated && !authLoading) {
    setLocation("/login");
    return null;
  }

  if (authLoading || !user) {
    return <div className="min-h-screen pt-20 text-center">Loading...</div>;
  }

  const handleUpdate = async () => {
    try {
      const updated = await updateMutation.mutateAsync({ id: user.id, data: formData });
      updateUser(updated);
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const statusColors: Record<string, "default" | "success" | "warning" | "info" | "destructive"> = {
    pending: "warning",
    processing: "info",
    shipped: "primary" as any,
    delivered: "success",
    cancelled: "destructive",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <Badge className="mt-1" variant="outline">{user.role}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-left" onClick={() => setIsEditing(true)}>
                <Settings className="w-4 h-4 mr-3" /> Edit Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4 mr-3" /> Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Full Name</label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Phone Number</label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Shipping Address</label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, City, Country" />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="text-primary" /> Order History
              </h2>
              
              {ordersLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
              ) : !ordersData?.orders?.length ? (
                <div className="py-12 text-center bg-muted/30 rounded-xl border border-border border-dashed">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-muted-foreground text-sm">When you place an order, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ordersData.orders.map(order => (
                    <div key={order.id} className="border border-border/50 rounded-xl p-6 hover:shadow-md transition-shadow bg-background/50">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-border/50">
                        <div>
                          <div className="font-mono text-sm text-muted-foreground mb-1">Order #{order.id.toString().padStart(6, '0')}</div>
                          <div className="font-semibold">{format(new Date(order.createdAt), 'MMMM d, yyyy')}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">{formatPrice(order.total)}</span>
                          <Badge variant={statusColors[order.orderStatus] || "default"} className="capitalize">
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.productId} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
