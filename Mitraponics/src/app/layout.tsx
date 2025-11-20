import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { UserAuthProvider } from '@/context/UserAuthContext';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'MitraPonics',
  description: 'Your one-stop shop for hydroponic supplies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserAuthProvider>
          <CartProvider>
              <ClientLayout>{children}</ClientLayout>
          </CartProvider>
          </UserAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}