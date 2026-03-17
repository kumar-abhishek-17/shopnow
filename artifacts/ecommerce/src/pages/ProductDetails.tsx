import { useParams } from "wouter";
import { useGetProduct, useGetProducts, useAddToWishlist } from "@workspace/api-client-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Minus, Plus, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  const { data: product, isLoading, error } = useGetProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const wishlistMutation = useAddToWishlist();

  // Fetch related products based on category
  const { data: relatedData } = useGetProducts({
    category: product?.category,
    limit: 4,
  }, {
    query: { enabled: !!product?.category }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (error || !product) {
    return <div className="min-h-screen flex items-center justify-center text-destructive text-xl font-bold">Product not found.</div>;
  }

  const images = [product.image, ...(product.images || [])];
  const displayImage = activeImage || product.image;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added.`,
    });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You must be logged in to save to wishlist.", variant: "destructive" });
      return;
    }
    wishlistMutation.mutate({ data: { productId: product.id } }, {
      onSuccess: () => toast({ title: "Saved", description: "Added to your wishlist." }),
      onError: () => toast({ title: "Error", description: "Could not add to wishlist.", variant: "destructive" })
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 shadow-lg relative">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="absolute top-4 left-4 bg-destructive text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-wider shadow-md">
                Sale
              </span>
            )}
            <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${displayImage === img ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt={`View ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-bold text-primary tracking-widest uppercase">{product.category}</div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{product.rating} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-muted-foreground line-through mb-1">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
            {product.description}
          </p>

          <div className="space-y-6 border-t border-border/50 pt-8 mt-auto">
            <div className="flex items-center gap-4">
              <span className="font-semibold w-20">Quantity:</span>
              <div className="flex items-center bg-muted rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background shadow-sm transition-all" disabled={quantity <= 1}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background shadow-sm transition-all" disabled={quantity >= product.stock}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground ml-4">{product.stock} available</span>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1 text-lg rounded-2xl shadow-xl hover:scale-[1.02]" onClick={handleAddToCart} disabled={product.stock === 0}>
                {product.stock === 0 ? "Out of Stock" : <><ShoppingCart className="mr-2" /> Add to Cart</>}
              </Button>
              <Button size="lg" variant="outline" className="w-16 rounded-2xl border-2" onClick={handleWishlist}>
                <Heart className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Truck className="w-5 h-5"/></div>
              <div className="text-sm font-medium">Free Shipping</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><RefreshCw className="w-5 h-5"/></div>
              <div className="text-sm font-medium">30-Day Returns</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck className="w-5 h-5"/></div>
              <div className="text-sm font-medium">2 Year Warranty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedData && relatedData.products.length > 1 && (
        <div className="pt-16 border-t border-border/50">
          <h2 className="text-3xl font-display font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedData.products.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
