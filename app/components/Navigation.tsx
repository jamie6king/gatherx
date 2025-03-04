'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavMenu from './NavMenu';

export default function Navigation() {
  return (
    <header className="bg-white text-foreground border-b shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center" tabIndex={0} aria-label="Go to homepage">
            <Image
              src="/images/logos/gatherx.png"
              alt="GatherX"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <NavMenu />
        </div>
      </nav>
    </header>
  );
} 