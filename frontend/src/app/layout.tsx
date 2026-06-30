import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/useAuth';
import { CartProvider } from '@/context/useCart';
import { Toaster } from 'react-hot-toast';
import GlobalThemeToggle from '@/components/GlobalThemeToggle';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
 title: {
 default: 'FoodRush — Order food you love',
 template: '%s | FoodRush',
 },
 description: 'Browse local restaurants and order your favourite meals',
 applicationName: 'FoodRush',
 icons: {
 icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
 apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
 },
};

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 themeColor: '#0f172a',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en"suppressHydrationWarning className={inter.variable}>
 <body className="bg-background text-foreground antialiased transition-colors duration-300">
 <ThemeProvider attribute="class"defaultTheme="system"enableSystem disableTransitionOnChange>
 <AuthProvider>
 <CartProvider>
 <GlobalThemeToggle />
 {children}
 <Toaster
 position="top-right"
 toastOptions={{
 style: {
 background: 'hsl(var(--card))',
 color: 'hsl(var(--foreground))',
 border: '1px solid hsl(var(--border))',
 },
 success: { iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--primary-foreground))' } },
 error: { duration: 5000 },
 }}
 />
 </CartProvider>
 </AuthProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
