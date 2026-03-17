import { Product } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const isDiscounted = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.id}`} className="group block h-full">
        <div className="h-full bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden relative">
          
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isDiscounted && (
              <span className="bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Sale
              </span>
            )}
            {product.featured && (
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Featured
              </span>
            )}
          </div>

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            {/* Quick Add Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
              <button
                onClick={handleAddToCart}
                className="w-full bg-white/90 backdrop-blur text-black font-semibold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">{product.category}</div>
            <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.numReviews})</span>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div className="flex flex-col">
                {isDiscounted && (
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(product.originalPrice!)}
                  </span>
                )}
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
