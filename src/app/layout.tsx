import type { Metadata } from 'next';
import './globals.css';
import WildlifeBackdrop from '@/components/WildlifeBackdrop';

export const metadata: Metadata = {
  title: 'Mayamba Lodge — Exclusive Riverside Safari Sanctuary',
  description:
    'Experience authentic riverside luxury at Mayamba Lodge. Check live room availability, view rates, browse our fact sheet, and reserve your stay directly.',
  keywords: 'Mayamba Lodge, safari, Zimbabwe, luxury lodge, river chalets, wildlife, reservations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WildlifeBackdrop />
        <div className="test-data-banner">
          <span>⚠️ TEST DATA PILOT RUN</span>
          <span>•</span>
          <span>ALL ROOMS & RATES ARE DEMONSTRATION RECORDS</span>
        </div>
        {children}
      </body>
    </html>
  );
}
