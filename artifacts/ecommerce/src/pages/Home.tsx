import { useState } from "react";
import { useGetProducts, useGetCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { useLocation } from "wouter";
import { Loader2, Filter, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const searchQuery = searchParams.get("search") || "";
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState<any>("newest");
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useGetCategories();
  const { data, isLoading, error } = useGetProducts({
    search: searchQuery,
    category: category || undefined,
    sortBy,
    page,
    limit: 12,
  });

  const categories = categoriesData?.categories || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section - Only show if not searching */}
      {!searchQuery && page === 1 && !category && (
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden mb-16">
          <div className="absolute inset-0">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-banner.png`} 
              alt="Premium Collection" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
                Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Lifestyle.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Discover our curated collection of premium essentials designed to inspire and endure. Experience quality without compromise.
              </p>
              <Button size="lg" className="rounded-full shadow-2xl hover:scale-105 transition-transform" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth'})}>
                Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Search results for "{searchQuery}"</h2>
            <p className="text-muted-foreground">{data?.total || 0} products found</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-primary" /> Categories
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setCategory(""); setPage(1); }}
                    className={`text-left px-4 py-2.5 rounded-xl transition-all ${
                      !category ? "bg-primary text-primary-foreground font-semibold shadow-md" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); setPage(1); }}
                      className={`text-left px-4 py-2.5 rounded-xl transition-all ${
                        category === c ? "bg-primary text-primary-foreground font-semibold shadow-md" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-display font-bold">
                {category ? category : "All Products"}
              </h2>
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-20 text-center text-destructive">
                Failed to load products. Please try again later.
              </div>
            ) : data?.products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setCategory(""); setPage(1); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data?.products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm font-medium">Page {page} of {data.totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      disabled={page === data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
