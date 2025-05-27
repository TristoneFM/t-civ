import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./providers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "T-CIV",
  description: "Sistema de Inspeccion de Autoclaves",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </ThemeRegistry>
      </body>
    </html>
  );
}
