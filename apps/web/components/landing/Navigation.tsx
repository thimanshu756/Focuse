'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Crown } from 'lucide-react';

import Logo from '@/app/public/assets/logo.png';
import { Skeleton } from '../ui/Skeleton';
interface NavigationProps {
  userTier?: 'FREE' | 'PRO';
  userName?: string;
  userAvatar?: string | null;
  userId?: string;
  isLoading?: boolean;
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

export function Navigation({
  isLoading,
  userTier,
  userName,
  userAvatar,
  userId,
}: NavigationProps = {}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isLoggedIn = !!userTier;
  const hasAvatar = userAvatar && userAvatar.trim() !== '';
  const avatarColor = getAvatarColor(userId);
  const avatarInitial = userName?.charAt(0).toUpperCase() || 'U';

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-accent transition-colors"
          >
            <Image
              src={Logo}
              alt="Focuse Logo"
              width={52}
              height={52}
              className="w-10 h-10"
              priority
            />
            <span>FOCUSE</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <Skeleton count={3} />
            ) : (
              <>
                {isLoggedIn ? (
                  <>
                    {userTier === 'FREE' && (
                      <button
                        onClick={() => router.push('/pricing')}
                        className="px-6 py-2.5 text-sm font-semibold bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <Crown size={16} />
                        Upgrade
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:text-text-secondary transition-colors"
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
                      {userName && <span className="text-sm">{userName}</span>}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-6 py-2.5 text-sm font-medium text-text-primary hover:text-text-secondary transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-6 py-2.5 text-sm font-semibold bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-sm hover:shadow-md"
                    >
                      Start Free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-primary hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  {isLoggedIn ? (
                    <>
                      {userTier === 'FREE' && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            router.push('/pricing');
                          }}
                          className="w-full px-6 py-2.5 text-sm font-semibold text-center bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <Crown size={16} />
                          Upgrade
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          router.push('/profile');
                        }}
                        className="w-full px-6 py-2.5 text-sm font-medium text-center text-text-primary hover:bg-gray-50 rounded-full transition-colors flex items-center justify-center gap-2"
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
                        {userName && <span>{userName}</span>}
                        {!userName && <span>Profile</span>}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-6 py-2.5 text-sm font-medium text-center text-text-primary hover:bg-gray-50 rounded-full transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-6 py-2.5 text-sm font-semibold text-center bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-sm"
                      >
                        Start Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
