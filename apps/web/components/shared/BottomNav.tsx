'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  Trees,
  BarChart3,
  User,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/forest', label: 'Forest', icon: Trees },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                active ? 'text-text-primary' : 'text-text-secondary'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active background */}
              {active && (
                <motion.div
                  className="absolute inset-0 bg-primary-accent/10 rounded-2xl"
                  layoutId="activeNavBg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <Icon
                  size={20}
                  className={`transition-colors ${
                    active ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>

              {/* Label */}
              <span
                className={`relative z-10 text-xs font-medium transition-colors ${
                  active ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
