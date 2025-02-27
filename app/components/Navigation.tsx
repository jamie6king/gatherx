'use client';

import Link from 'next/link';
import NavMenu from './NavMenu';

export default function Navigation() {
  return (
    <header className="bg-primary text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-primary-light transition">
            GatherX
          </Link>
          <NavMenu />
        </div>
      </nav>
    </header>
  );
} 