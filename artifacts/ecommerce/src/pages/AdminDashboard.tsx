import { useState } from "react";
import { useGetAdminStats, useGetProducts, useGetUsers, useGetOrders, useUpdateOrderStatus, useDeleteProduct, useDeleteUser, useCreateProduct, useUpdateProduct } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { 
  DollarSign, ShoppingBag, Package, Users, TrendingUp, 
  Edit, Trash2, Plus, Eye, RefreshCw, ChevronRight,
  Check, X, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl p-6 border border-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users">("overview");
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", originalPrice: "", category: "", image: "", stock: "", featured: false });
  const { toast } = useToast();

  const { data: stats, refetch: refetchStats } = useGetAdminStats();
  const { data: productsData, refetch: refetchProducts } = useGetProducts({ page: productPage, limit: 10 });
  const { data: ordersData, refetch: refetchOrders } = useGetOrders({ page: orderPage, limit: 10 });
  const { data: usersData, refetch: refetchUsers } = useGetUsers({ page: userPage, limit: 10 });

  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const handleStatusChange = (orderId: number, orderStatus: string) => {
    updateStatus({ id: orderId, data: { orderStatus: orderStatus as any } }, {
      onSuccess: () => { toast({ title: "Order status updated" }); refetchOrders(); },
      onError: () => toast({ title: "Failed to update", variant: "destructive" }),
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct({ id }, {
      onSuccess: () => { toast({ title: "Product deleted" }); refetchProducts(); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handleDeleteUser = (id: number) => {
    if (!confirm("Delete this user?")) return;
    deleteUser({ id }, {
      onSuccess: () => { toast({ title: "User deleted" }); refetchUsers(); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      stock: parseInt(productForm.stock),
      images: [productForm.image],
      tags: [],
    };
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data: data as any }, {
        onSuccess: () => { toast({ title: "Product updated" }); setShowProductForm(false); refetchProducts(); setEditingProduct(null); },
        onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
      });
    } else {
      createProduct({ data: data as any }, {
        onSuccess: () => { toast({ title: "Product created" }); setShowProductForm(false); refetchProducts(); },
        onError: () => toast({ title: "Failed to create product", variant: "destructive" }),
      });
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      image: product.image,
      stock: String(product.stock),
      featured: product.featured,
    });
    setShowProductForm(true);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your store</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} color="bg-green-500" trend="All time" />
              <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingBag} color="bg-blue-500" trend="All orders" />
              <StatCard label="Products" value={stats?.totalProducts || 0} icon={Package} color="bg-purple-500" trend="In catalog" />
              <StatCard label="Users" value={stats?.totalUsers || 0} icon={Users} color="bg-orange-500" trend="Registered" />
            </div>

            {/* Revenue Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Revenue by Month</h2>
                {stats?.revenueByMonth && stats.revenueByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip formatter={(v: any) => [`$${v.toFixed(2)}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">No revenue data yet</div>
                )}
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
                <div className="space-y-3">
                  {stats?.ordersByStatus && Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", STATUS_COLORS[status])}>{status}</span>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                  {(!stats?.ordersByStatus || Object.keys(stats.ordersByStatus).length === 0) && (
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Order ID</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Total</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order: any) => (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 font-mono">#{order.id}</td>
                          <td className="py-3 font-semibold">${order.total?.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", STATUS_COLORS[order.orderStatus])}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent orders</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Products ({productsData?.total || 0})</h2>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ name: "", description: "", price: "", originalPrice: "", category: "", image: "", stock: "", featured: false }); setShowProductForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />Add Product
              </Button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
                  <h3 className="text-lg font-semibold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    {[
                      { label: "Name", key: "name", type: "text" },
                      { label: "Price", key: "price", type: "number" },
                      { label: "Original Price (optional)", key: "originalPrice", type: "number" },
                      { label: "Category", key: "category", type: "text" },
                      { label: "Image URL", key: "image", type: "url" },
                      { label: "Stock", key: "stock", type: "number" },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <input
                          type={type}
                          value={(productForm as any)[key]}
                          onChange={(e) => setProductForm(prev => ({ ...prev, [key]: e.target.value }))}
                          required={key !== "originalPrice"}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="featured" checked={productForm.featured} onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))} />
                      <label htmlFor="featured" className="text-sm">Featured product</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="flex-1">{editingProduct ? "Update" : "Create"}</Button>
                      <Button type="button" variant="outline" onClick={() => setShowProductForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData?.products.map((product) => (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40/muted/foreground?text=P"; }} />
                            <div>
                              <p className="font-medium line-clamp-1">{product.name}</p>
                              {product.featured && <span className="text-xs text-primary">Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.category}</td>
                        <td className="p-4 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={cn("font-medium", product.stock === 0 ? "text-destructive" : product.stock < 10 ? "text-orange-500" : "text-green-600")}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">⭐ {product.rating.toFixed(1)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEditProduct(product)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="p-4 flex justify-between items-center border-t border-border">
                <p className="text-sm text-muted-foreground">Page {productPage} of {productsData?.totalPages || 1}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setProductPage(p => p + 1)} disabled={productPage >= (productsData?.totalPages || 1)}>Next</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Orders ({ordersData?.total || 0})</h2>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData?.orders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono font-medium">#{order.id}</td>
                        <td className="p-4 text-muted-foreground">{order.items.length} item(s)</td>
                        <td className="p-4 font-semibold">${order.total.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", STATUS_COLORS[order.paymentStatus])}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", STATUS_COLORS[order.orderStatus])}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</td>
                        <td className="p-4">
                          <select
                            defaultValue={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 flex justify-between items-center border-t border-border">
                <p className="text-sm text-muted-foreground">Page {orderPage} of {ordersData?.totalPages || 1}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setOrderPage(p => p + 1)} disabled={orderPage >= (ordersData?.totalPages || 1)}>Next</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Users ({usersData?.total || 0})</h2>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.users.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.email}</td>
                        <td className="p-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === "admin"}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 flex justify-between items-center border-t border-border">
                <p className="text-sm text-muted-foreground">Page {userPage} of {usersData?.totalPages || 1}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setUserPage(p => p + 1)} disabled={userPage >= (usersData?.totalPages || 1)}>Next</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
