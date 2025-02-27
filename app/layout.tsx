import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GatherX',
  description: 'Event management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background-light text-text-primary min-h-screen`}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <footer className="bg-primary text-white mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p>&copy; {new Date().getFullYear()} GatherX. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
} 