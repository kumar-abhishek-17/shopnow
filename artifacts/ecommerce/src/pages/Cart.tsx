import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 shadow-lg hover:-translate-y-1">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-10">Shopping Cart <span className="text-muted-foreground text-2xl font-normal">({totalItems} items)</span></h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-grow justify-between">
                <div className="flex justify-between items-start">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="text-lg sm:text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <button onClick={() => removeFromCart(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2 -mt-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
                  <div className="flex items-center bg-muted rounded-xl p-1 w-fit">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-all">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-2xl font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-28 bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping estimate</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax estimate</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-lg">Total</span>
              <span className="text-3xl font-display font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg group">
                Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
