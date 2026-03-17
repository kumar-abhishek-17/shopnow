import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && user?.role !== "admin") return <Redirect to="/" />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AppLayout><Home /></AppLayout>
      </Route>
      <Route path="/products/:id">
        {(params) => <AppLayout><ProductDetails id={params.id} /></AppLayout>}
      </Route>
      <Route path="/cart">
        <AppLayout><Cart /></AppLayout>
      </Route>
      <Route path="/checkout">
        <AppLayout>
          <ProtectedRoute><Checkout /></ProtectedRoute>
        </AppLayout>
      </Route>
      <Route path="/login">
        <AppLayout><Login /></AppLayout>
      </Route>
      <Route path="/register">
        <AppLayout><Register /></AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout>
          <ProtectedRoute><Profile /></ProtectedRoute>
        </AppLayout>
      </Route>
      <Route path="/wishlist">
        <AppLayout>
          <ProtectedRoute><Wishlist /></ProtectedRoute>
        </AppLayout>
      </Route>
      <Route path="/admin">
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route>
        <AppLayout><NotFound /></AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
