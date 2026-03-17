import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  paymentMethod: z.enum(["credit_card", "cash_on_delivery"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrderMutation = useCreateOrder();
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      country: "United States",
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Redirect if cart empty and not success
  if (items.length === 0 && !orderSuccess) {
    setLocation("/cart");
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !orderSuccess) {
    setLocation("/login");
    toast({ title: "Login required", description: "Please login to checkout." });
    return null;
  }

  const tax = totalPrice * 0.08;
  const shipping = totalPrice > 100 ? 0 : 15;
  const finalTotal = totalPrice + tax + shipping;

  const onSubmit = async (data: CheckoutForm) => {
    try {
      await createOrderMutation.mutateAsync({
        data: {
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            fullName: data.fullName,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          },
          paymentMethod: data.paymentMethod,
        }
      });
      setOrderSuccess(true);
      clearCart();
      window.scrollTo(0,0);
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Thank you for your purchase. We've received your order and will begin processing it shortly.
        </p>
        <Button size="lg" onClick={() => setLocation("/profile")} className="rounded-xl px-8 shadow-lg hover:-translate-y-0.5">
          View Order History
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Shipping Info */}
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold">Full Name</label>
                  <Input {...register("fullName")} placeholder="John Doe" />
                  {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold">Street Address</label>
                  <Input {...register("address")} placeholder="123 Main St, Apt 4B" />
                  {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">City</label>
                  <Input {...register("city")} placeholder="New York" />
                  {errors.city && <span className="text-xs text-destructive">{errors.city.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Postal Code</label>
                  <Input {...register("postalCode")} placeholder="10001" />
                  {errors.postalCode && <span className="text-xs text-destructive">{errors.postalCode.message}</span>}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold">Country</label>
                  <Input {...register("country")} />
                  {errors.country && <span className="text-xs text-destructive">{errors.country.message}</span>}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" value="credit_card" {...register("paymentMethod")} className="sr-only" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'credit_card' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">Credit Card</div>
                    <div className="text-xs text-muted-foreground">Pay with Visa, Mastercard</div>
                  </div>
                </label>

                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" value="cash_on_delivery" {...register("paymentMethod")} className="sr-only" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'cash_on_delivery' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay when you receive</div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mock Payment Details</div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Card Number</label>
                    <Input placeholder="0000 0000 0000 0000" disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Expiry Date</label>
                      <Input placeholder="MM/YY" disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">CVC</label>
                      <Input placeholder="123" disabled />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-28 bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Review Order</h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    <div className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3 text-sm mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-semibold text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8%)</span>
                <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-lg">Total</span>
              <span className="text-3xl font-display font-bold text-primary">{formatPrice(finalTotal)}</span>
            </div>

            <Button 
              form="checkout-form" 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl shadow-lg"
              isLoading={createOrderMutation.isPending}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
