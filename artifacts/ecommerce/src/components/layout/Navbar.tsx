import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ShoppingBag, Search, User, Moon, Sun, Menu, LogOut, Heart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-display font-bold text-xl shadow-lg">
              S
            </div>
            <span className="font-display font-bold text-2xl hidden sm:block tracking-tight">
              Shop<span className="text-primary">Now</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full h-12 pl-12 pr-4 rounded-full bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/wishlist" className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  <User className="w-5 h-5" />
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className="hidden lg:block text-sm font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors hidden sm:block"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-primary/5">
                Sign In
              </Link>
            )}

            <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-background">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full hover:bg-muted text-muted-foreground md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </form>
              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted font-medium">
                      <User className="w-5 h-5 text-muted-foreground" /> Profile
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted font-medium">
                      <Heart className="w-5 h-5 text-muted-foreground" /> Wishlist
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted font-medium text-primary">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive font-medium text-left">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted font-medium">
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
