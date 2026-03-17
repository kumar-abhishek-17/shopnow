import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-display font-bold shadow-md">
                S
              </div>
              <span className="font-display font-bold text-xl">Shop<span className="text-primary">Now</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium quality products designed for your modern lifestyle. Fast shipping, easy returns, and unparalleled customer service.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/?category=Electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/?category=Clothing" className="hover:text-primary transition-colors">Clothing</Link></li>
              <li><Link href="/?category=Home" className="hover:text-primary transition-colors">Home & Garden</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to get special offers, free giveaways, and updates.</p>
            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
              <button className="h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ShopNow. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
