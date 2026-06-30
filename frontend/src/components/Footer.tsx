import Link from 'next/link';
import { ChefHat, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
                <ChefHat size={20} className="text-white"/>
              </div>
              <span className="font-display text-2xl font-bold text-foreground">
                Food<span className="text-brand-400">Rush</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Discover delicious meals from your favorite local restaurants and get them delivered fast.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition hover:text-foreground">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-foreground">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="transition hover:text-foreground">
                  Help Assistant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-brand-400"/>
                <span>+1 (555) 014-2048</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-brand-400"/>
                <span>support@foodrush.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-400"/>
                <span>123 Flavor Street, Downtown</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 FoodRush. All rights reserved.</p>
          <p>Fast delivery • Fresh meals • Easy ordering</p>
        </div>
      </div>
    </footer>
  );
}
