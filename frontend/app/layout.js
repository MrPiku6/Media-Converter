import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Video Conversion Powerhouse',
  description: 'A full-stack web application for video and audio conversion and editing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* <-- WRAP HERE */}
          <Toaster position="top-center" reverseOrder={false} />
          <main>{children}</main>
        </AuthProvider> {/* <-- AND CLOSE HERE */}
      </body>
    </html>
  );
}
