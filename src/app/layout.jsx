import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VoteSecure — Enterprise Voting Platform",
  description: "Secure, transparent, and auditable digital elections.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="corporate">
      <body className={inter.className}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "8px", fontSize: "14px" },
          }}
        />
        {children}
      </body>
    </html>
  );
}
