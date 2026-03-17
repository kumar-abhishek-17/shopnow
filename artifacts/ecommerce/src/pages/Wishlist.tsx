import { useGetWishlist, useRemoveFromWishlist } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, HeartCrack, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Wishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetWishlist({
    query: { enabled: isAuthenticated }
  });

  const removeMutation = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      }
    }
  });

  if (!isAuthenticated && !authLoading) {
    setLocation("/login");
    return null;
  }

  if (isLoading || authLoading) {
    return <div className="min-h-screen flex justify-center pt-32"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const items = data?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-4xl font-display font-bold">My Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-card rounded-3xl border border-border/50 text-center p-8 shadow-sm">
          <HeartCrack className="w-16 h-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Save items you love to your wishlist to easily find them later or add them to your cart.</p>
          <Link href="/">
            <Button size="lg" className="rounded-full">Discover Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ id, productId, product }) => (
            <div key={id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeMutation.mutate({ productId });
                }}
                className="absolute top-3 right-3 z-20 p-2 bg-background/80 backdrop-blur rounded-full text-destructive shadow-md hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                disabled={removeMutation.isPending}
              >
                <HeartCrack className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
