'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Crown } from 'lucide-react';

interface HeaderProps {
  userTier?: 'FREE' | 'PRO';
  userName?: string;
  userAvatar?: string | null;
  userId?: string;
}

// Generate a consistent color based on user ID
function getAvatarColor(userId?: string): string {
  if (!userId) return '#6366f1';
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#ef4444',
    '#14b8a6',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Header({
  userTier = 'FREE',
  userName,
  userAvatar,
  userId,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [avatarError, setAvatarError] = React.useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/forest', label: 'Forest' },
    { href: '/insights', label: 'Insights' },
  ];

  const isActive = (href: string) => pathname === href;

  const hasAvatar = userAvatar && userAvatar.trim() !== '';
  const avatarColor = getAvatarColor(userId);
  const avatarInitial = userName?.charAt(0).toUpperCase() || 'U';

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
              {hasAvatar && !avatarError ? (
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  <img
                    src={userAvatar!}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </div>
              ) : (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatarInitial}
                </div>
              )}
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
