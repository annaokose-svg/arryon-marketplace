import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import ErrorBoundary from '../components/ErrorBoundary';
import LiveChat from '../components/LiveChat';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'Arryona Marketplace',
  description: 'A real multi-vendor marketplace for sellers and buyers.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <ErrorBoundary>
            <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>
          </ErrorBoundary>
          <Footer />
          <BackToTop />
          <LiveChat />
        </AuthProvider>
      </body>
    </html>
  );
}
