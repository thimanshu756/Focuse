'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { User, Crown } from 'lucide-react';

interface HeaderProps {
  userTier?: 'FREE' | 'PRO';
  userName?: string;
}

export function Header({ userTier = 'FREE', userName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/forest', label: 'Forest' },
    { href: '/insights', label: 'Insights' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-accent transition-colors"
          >
            <span className="text-2xl">🌳</span>
            <span>Sylva</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {userTier === 'FREE' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/upgrade')}
                className="hidden sm:flex items-center gap-2"
              >
                <Crown size={16} />
                Upgrade
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2"
              aria-label="Profile"
            >
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                <User size={16} className="text-accent" />
              </div>
              {userName && (
                <span className="hidden md:inline text-sm">{userName}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
