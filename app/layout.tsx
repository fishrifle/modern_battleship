import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern Battleship - Naval Warfare Strategy Game",
  description: "Command real naval fleets in strategic battles. Play PvP or vs AI with authentic warships from 15 nations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
