'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  User,
  CreditCard,
  Shield,
  AlertTriangle,
  Scale,
  Ban,
  XCircle,
  AlertCircle,
  Sparkles,
  Mail,
} from 'lucide-react';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  subscriptionTier: 'FREE' | 'PRO';
  avatar?: string | null;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile if authenticated
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      setUserProfile(null);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data) {
          const user = response.data.data.user || response.data.data;
          setUserProfile({
            id: user.id,
            name: user.name || '',
            subscriptionTier: user.subscriptionTier || 'FREE',
            avatar: user.avatar || null,
          });
        }
      } catch (error) {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [mounted]);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute('data-section') || '';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.querySelector(`[data-section="${id}"]`);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const lastUpdated = 'January 21, 2026';
  const effectiveDate = 'January 1, 2026';

  const tableOfContents = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FileText size={18} />,
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: <Sparkles size={18} />,
    },
    { id: 'accounts', title: 'User Accounts', icon: <User size={18} /> },
    {
      id: 'billing',
      title: 'Subscription & Billing',
      icon: <CreditCard size={18} />,
    },
    {
      id: 'responsibilities',
      title: 'User Responsibilities',
      icon: <Shield size={18} />,
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: <Scale size={18} />,
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      icon: <Ban size={18} />,
    },
    { id: 'termination', title: 'Termination', icon: <XCircle size={18} /> },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      icon: <AlertTriangle size={18} />,
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertCircle size={18} />,
    },
    { id: 'contact', title: 'Contact Information', icon: <Mail size={18} /> },
  ];

  const sections: Section[] = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FileText size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            Welcome to Focuse, an AI-powered focus timer and productivity
            platform operated by RakrAI Technologies Private Limited ("Company,"
            "we," "us," or "our"). These Terms of Service ("Terms") govern your
            access to and use of our website, mobile applications, and related
            services (collectively, the "Services").
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-yellow-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-2">
                  Important Notice
                </h4>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  By creating an account, accessing, or using our Services, you
                  acknowledge that you have read, understood, and agree to be
                  bound by these Terms and our Privacy Policy. If you do not
                  agree with any part of these Terms, you must not use our
                  Services.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                1.1 Eligibility
              </h4>
              <p className="text-[#64748B]">
                You must be at least 13 years old to use our Services. If you
                are under 18, you must have permission from a parent or legal
                guardian. By using Focuse, you represent and warrant that you
                meet these requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                1.2 Modifications to Terms
              </h4>
              <p className="text-[#64748B]">
                We reserve the right to modify these Terms at any time. We will
                notify you of material changes via email or through a prominent
                notice on our Services. Your continued use of the Services after
                such notification constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                1.3 Additional Policies
              </h4>
              <p className="text-[#64748B]">
                These Terms incorporate by reference our Privacy Policy, which
                describes how we collect, use, and protect your personal
                information. Additional policies may apply to specific features
                or services.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: <Sparkles size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            Focuse provides an AI-powered productivity platform that helps users
            manage their time, tasks, and focus sessions. Our Services include:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">Focus Timer</h4>
              <p className="text-[#64748B] text-sm">
                Customizable Pomodoro-style timer to help you maintain focus and
                productivity with configurable work and break intervals.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Task Management
              </h4>
              <p className="text-[#64748B] text-sm">
                Create, organize, and track your tasks with intuitive tools
                designed to keep you on top of your work.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                AI-Powered Insights
              </h4>
              <p className="text-[#64748B] text-sm">
                Chitra AI analyzes your productivity patterns and provides
                personalized recommendations to improve your workflow.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Forest Visualization
              </h4>
              <p className="text-[#64748B] text-sm">
                Watch your focus forest grow as you complete sessions, creating
                a visual representation of your productivity journey.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Analytics Dashboard
              </h4>
              <p className="text-[#64748B] text-sm">
                Track your progress with detailed statistics, charts, and
                insights about your focus patterns and productivity trends.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Ambient Sounds
              </h4>
              <p className="text-[#64748B] text-sm">
                Choose from curated ambient sounds and music to enhance your
                focus during work sessions.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
            <h4 className="font-semibold text-[#0F172A] mb-2">
              Service Availability
            </h4>
            <p className="text-[#64748B] text-sm mb-3">
              We strive to provide reliable, uninterrupted access to our
              Services. However:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
              <li>
                Services may be temporarily unavailable for maintenance,
                updates, or technical issues
              </li>
              <li>We do not guarantee 100% uptime or uninterrupted access</li>
              <li>
                Features and functionality may change or be discontinued with
                notice
              </li>
              <li>
                AI-generated content may not always be accurate or complete
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'accounts',
      title: 'User Accounts and Registration',
      icon: <User size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            To access certain features of our Services, you must create an
            account. You are responsible for maintaining the security of your
            account.
          </p>

          <div className="space-y-4 mt-6">
            <div className="border-l-4 border-blue-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Account Creation
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>Maintain and promptly update your account information</li>
                <li>Choose a strong, unique password</li>
                <li>One person or entity may only maintain one account</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Account Security
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>
                  You are solely responsible for maintaining the confidentiality
                  of your password
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>
                  Notify us immediately of any unauthorized access or security
                  breach
                </li>
                <li>Never share your login credentials with anyone</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Account Termination
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>
                  You may delete your account at any time from your profile
                  settings
                </li>
                <li>
                  We may suspend or terminate your account for violations of
                  these Terms
                </li>
                <li>
                  Upon termination, you lose access to your data (export it
                  before deleting)
                </li>
                <li>Certain information may be retained as required by law</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={24}
                className="text-red-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-2">
                  Prohibited Account Activities
                </h4>
                <p className="text-[#64748B] text-sm mb-2">You may not:</p>
                <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                  <li>
                    Create accounts using automated means or false information
                  </li>
                  <li>
                    Share or sell your account to another person or entity
                  </li>
                  <li>Use another user's account without permission</li>
                  <li>
                    Create multiple accounts to abuse free tier limitations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'billing',
      title: 'Subscription and Billing',
      icon: <CreditCard size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            Focuse offers both free and paid subscription plans. By upgrading to
            a paid plan, you agree to the following billing terms:
          </p>

          <div className="space-y-4 mt-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Subscription Plans
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-[#0F172A]">FREE Plan</p>
                  <p className="text-[#64748B] text-sm">
                    Access to basic features with limitations on sessions, AI
                    reports, and advanced functionality.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">PRO Plan</p>
                  <p className="text-[#64748B] text-sm">
                    Unlimited access to all features, including unlimited
                    sessions, AI insights, advanced analytics, and priority
                    support. Available as monthly or yearly subscription.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Payment Terms
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] text-sm ml-4">
                <li>
                  <strong>Payment Processing:</strong> All payments are
                  processed securely through Razorpay, our PCI-DSS compliant
                  payment partner
                </li>
                <li>
                  <strong>Billing Cycle:</strong> Subscriptions are billed in
                  advance on a monthly or yearly basis
                </li>
                <li>
                  <strong>Auto-Renewal:</strong> Subscriptions automatically
                  renew unless cancelled before the renewal date
                </li>
                <li>
                  <strong>Price Changes:</strong> We reserve the right to change
                  pricing with 30 days' notice to existing subscribers
                </li>
                <li>
                  <strong>Taxes:</strong> Prices are exclusive of applicable
                  taxes, which will be added at checkout
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Cancellation and Refunds
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-[#0F172A]">Cancellation</p>
                  <p className="text-[#64748B]">
                    You may cancel your subscription at any time from your
                    account settings. Cancellation takes effect at the end of
                    your current billing period. You will retain PRO access
                    until that date.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Refund Policy</p>
                  <p className="text-[#64748B]">
                    We offer a 7-day money-back guarantee for first-time PRO
                    subscribers. To request a refund, contact us at{' '}
                    <a
                      href="mailto:support@focuse.rakriai.com"
                      className="text-blue-600 hover:underline"
                    >
                      support@focuse.rakriai.com
                    </a>{' '}
                    within 7 days of purchase. Refunds are not available for
                    renewals or after 7 days.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Failed Payments</p>
                  <p className="text-[#64748B]">
                    If your payment fails, we will attempt to charge your
                    payment method up to 3 times. If payment cannot be
                    processed, your account will be downgraded to the FREE plan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mt-6">
            <h4 className="font-semibold text-[#0F172A] mb-2">
              Fair Usage Policy
            </h4>
            <p className="text-[#64748B] text-sm">
              While PRO plans offer "unlimited" features, we reserve the right
              to enforce fair usage policies to prevent abuse. Excessive usage
              that impacts service performance for other users may result in
              temporary restrictions or account suspension.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'responsibilities',
      title: 'User Responsibilities and Acceptable Use',
      icon: <Shield size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            As a user of Focuse, you agree to use our Services responsibly and
            in compliance with all applicable laws and regulations.
          </p>

          <div className="space-y-4 mt-6">
            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Your Content
              </h4>
              <p className="text-[#64748B] text-sm mb-3">
                You retain ownership of all content you create or upload to
                Focuse (tasks, notes, etc.). However, you grant us a limited
                license to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>
                  Store and display your content as necessary to provide the
                  Services
                </li>
                <li>
                  Process your content through our AI systems to generate
                  insights
                </li>
                <li>
                  Create aggregated, anonymized statistics for service
                  improvement
                </li>
              </ul>
              <p className="text-[#64748B] text-sm mt-3">
                You are responsible for ensuring you have the right to upload
                and use any content you submit to our Services.
              </p>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Acceptable Use
              </h4>
              <p className="text-[#64748B] text-sm mb-3">
                You agree to use Focuse only for lawful purposes. You must not:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Violate any local, national, or international laws</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Transmit malicious code, viruses, or harmful software</li>
                <li>
                  Attempt to gain unauthorized access to our systems or other
                  users' accounts
                </li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>
                  Use automated scripts or bots (except through authorized APIs)
                </li>
                <li>Collect user information without consent</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Content Standards
              </h4>
              <p className="text-[#64748B] text-sm mb-3">
                While Focuse is primarily a productivity tool, any content you
                share or make visible to others must not contain:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Illegal, fraudulent, or misleading material</li>
                <li>Hate speech, discrimination, or harassment</li>
                <li>Explicit adult content or child exploitation material</li>
                <li>Personal information of others without consent</li>
                <li>Spam, advertising, or commercial solicitation</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      icon: <Scale size={24} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Our Intellectual Property
              </h4>
              <p className="text-[#64748B] mb-3">
                All content, features, and functionality of Focuse (including
                but not limited to text, graphics, logos, icons, images, audio
                clips, software, and design) are owned by RakrAI Technologies
                Private Limited or our licensors and are protected by copyright,
                trademark, and other intellectual property laws.
              </p>
              <p className="text-[#64748B]">
                You may not copy, modify, distribute, sell, or lease any part of
                our Services or included software, nor may you reverse engineer
                or attempt to extract the source code, unless permitted by law
                or with our written permission.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">Trademarks</h4>
              <p className="text-[#64748B]">
                "Focuse," the Focuse logo, "Chitra AI," and other marks are
                trademarks of RakrAI Technologies Private Limited. You may not
                use these trademarks without our prior written permission.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                User Content License
              </h4>
              <p className="text-[#64748B]">
                By submitting content to Focuse, you grant us a worldwide,
                non-exclusive, royalty-free license to use, reproduce, modify,
                and display that content solely for the purpose of providing and
                improving the Services. This license terminates when you delete
                your content or account, except for content that has been shared
                with or processed by other users.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Feedback and Suggestions
              </h4>
              <p className="text-[#64748B]">
                If you provide us with feedback, suggestions, or ideas about our
                Services, you grant us the right to use them without restriction
                or compensation. We may incorporate your feedback into our
                Services without attribution.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mt-6">
            <h4 className="font-semibold text-[#0F172A] mb-2">
              Copyright Infringement
            </h4>
            <p className="text-[#64748B] text-sm mb-3">
              We respect intellectual property rights. If you believe your work
              has been copied in a way that constitutes copyright infringement,
              please contact us at{' '}
              <a
                href="mailto:legal@focuse.rakriai.com"
                className="text-purple-600 hover:underline"
              >
                legal@focuse.rakriai.com
              </a>{' '}
              with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing material on our Services</li>
              <li>Your contact information</li>
              <li>Statement of good faith belief that use is unauthorized</li>
              <li>
                Statement of accuracy and authority to act on behalf of
                copyright owner
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      icon: <Ban size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            The following activities are strictly prohibited when using Focuse:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Ban size={20} className="text-red-600" />
                <h4 className="font-semibold text-[#0F172A]">
                  Security Violations
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] text-sm ml-4">
                <li>Hacking, cracking, or attacking our systems</li>
                <li>Attempting to bypass security measures</li>
                <li>Unauthorized access to accounts or data</li>
                <li>Introducing malware or viruses</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Ban size={20} className="text-red-600" />
                <h4 className="font-semibold text-[#0F172A]">
                  Abuse of Services
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] text-sm ml-4">
                <li>Creating multiple accounts for free tier abuse</li>
                <li>Reselling or sublicensing our Services</li>
                <li>Excessive API calls or automated scraping</li>
                <li>Using services for competing products</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Ban size={20} className="text-red-600" />
                <h4 className="font-semibold text-[#0F172A]">
                  Harmful Content
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] text-sm ml-4">
                <li>Illegal or fraudulent activities</li>
                <li>Hate speech or harassment</li>
                <li>Distribution of malware</li>
                <li>Child exploitation material</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Ban size={20} className="text-red-600" />
                <h4 className="font-semibold text-[#0F172A]">
                  Misrepresentation
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] text-sm ml-4">
                <li>Impersonating others or entities</li>
                <li>Providing false information</li>
                <li>Misleading claims about features</li>
                <li>Fraudulent payment methods</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0F172A] text-white rounded-2xl p-6 mt-6">
            <h4 className="font-semibold mb-2">Consequences of Violations</h4>
            <p className="text-gray-300 text-sm">
              Violation of these prohibitions may result in immediate account
              suspension or termination, legal action, and reporting to law
              enforcement authorities. We reserve the right to take any action
              we deem necessary to protect our Services, users, and business
              interests.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'termination',
      title: 'Termination and Suspension',
      icon: <XCircle size={24} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Termination by You
              </h4>
              <p className="text-[#64748B] mb-3">
                You may terminate your account at any time by:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4">
                <li>
                  Accessing your profile settings and selecting "Delete Account"
                </li>
                <li>
                  Contacting our support team at{' '}
                  <a
                    href="mailto:support@focuse.rakriai.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@focuse.rakriai.com
                  </a>
                </li>
              </ul>
              <p className="text-[#64748B] mt-3">
                Upon termination, you will immediately lose access to your
                account and data. We recommend exporting your data before
                deletion. If you have an active subscription, cancellation does
                not result in a refund for the current billing period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Termination by Us
              </h4>
              <p className="text-[#64748B] mb-3">
                We reserve the right to suspend or terminate your account at any
                time, with or without notice, for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent, illegal, or harmful activities</li>
                <li>Non-payment of subscription fees</li>
                <li>Extended periods of inactivity (after notice)</li>
                <li>At our discretion for business or operational reasons</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Effect of Termination
              </h4>
              <p className="text-[#64748B]">
                Upon termination of your account:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 mt-2">
                <li>Your right to use the Services immediately ceases</li>
                <li>We may delete your account and all associated data</li>
                <li>You remain liable for any outstanding payments</li>
                <li>
                  Provisions of these Terms that should reasonably survive
                  termination will continue to apply (e.g., disclaimers,
                  liability limitations, indemnification)
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-orange-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-2">
                  Data Retention After Termination
                </h4>
                <p className="text-[#64748B] text-sm">
                  We may retain certain information as required by law, for
                  legitimate business purposes, or to resolve disputes. Backup
                  copies of your data may persist for up to 90 days after
                  deletion. After this period, all data will be permanently
                  deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers and Warranties',
      icon: <AlertTriangle size={24} />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={28}
                className="text-yellow-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-bold text-[#0F172A] mb-3 text-lg">
                  IMPORTANT LEGAL NOTICE
                </h4>
                <p className="text-[#64748B] leading-relaxed">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE
                  FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES,
                  INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                  NON-INFRINGEMENT.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                No Warranty of Accuracy
              </h4>
              <p className="text-[#64748B]">
                We do not warrant that the Services will be error-free,
                uninterrupted, secure, or free from viruses or other harmful
                components. AI-generated content may contain inaccuracies, and
                we make no guarantees about the accuracy, reliability, or
                completeness of any content, including Chitra AI
                recommendations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                No Productivity Guarantees
              </h4>
              <p className="text-[#64748B]">
                While Focuse is designed to help improve productivity, we make
                no guarantees that using our Services will result in increased
                productivity, improved focus, or achievement of your goals.
                Results vary by individual.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                AI Service Limitations
              </h4>
              <p className="text-[#64748B]">
                Chitra AI and other AI features are provided for convenience and
                assistance. AI-generated recommendations, insights, and task
                breakdowns should not be relied upon as professional advice.
                Always use your own judgment and verify AI-generated content.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Third-Party Services
              </h4>
              <p className="text-[#64748B]">
                Our Services may integrate with or link to third-party services
                (e.g., payment processors, authentication providers). We are not
                responsible for the content, policies, or practices of any
                third-party services. Your use of third-party services is at
                your own risk and subject to their terms and conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Jurisdictional Limitations
              </h4>
              <p className="text-[#64748B]">
                Some jurisdictions do not allow the exclusion of certain
                warranties. If these laws apply to you, some of the above
                exclusions may not apply, and you may have additional rights.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertCircle size={24} />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={28}
                className="text-red-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-bold text-[#0F172A] mb-3 text-lg">
                  LIMITATION OF LIABILITY
                </h4>
                <p className="text-[#64748B] leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL
                  RAKRAI TECHNOLOGIES PRIVATE LIMITED, ITS DIRECTORS, EMPLOYEES,
                  PARTNERS, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                  INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE,
                  GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
              <li>
                Your access to or use of (or inability to access or use) the
                Services
              </li>
              <li>Any conduct or content of any third party on the Services</li>
              <li>Any content obtained from the Services</li>
              <li>
                Unauthorized access, use, or alteration of your transmissions or
                content
              </li>
              <li>AI-generated content or recommendations</li>
              <li>Loss of productivity or failure to achieve goals</li>
              <li>Data loss, corruption, or breaches</li>
              <li>System downtime or service interruptions</li>
            </ul>
          </div>

          <div className="space-y-4 mt-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Maximum Liability Cap
              </h4>
              <p className="text-[#64748B]">
                Our total liability to you for all claims arising from or
                related to the Services shall not exceed the greater of: (a) the
                amount you paid us in the 12 months prior to the event giving
                rise to liability, or (b) ₹5,000 INR.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Basis of the Bargain
              </h4>
              <p className="text-[#64748B]">
                These limitations apply even if we have been advised of the
                possibility of such damages. These limitations reflect the
                allocation of risk between you and us and are fundamental to the
                terms of this agreement. The Services would not be provided
                without such limitations.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Indemnification
              </h4>
              <p className="text-[#64748B]">
                You agree to indemnify, defend, and hold harmless RakrAI
                Technologies Private Limited and its officers, directors,
                employees, and agents from any claims, liabilities, damages,
                losses, and expenses (including legal fees) arising from: (a)
                your use of the Services, (b) your violation of these Terms, (c)
                your violation of any rights of another party, or (d) your
                content.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
            <p className="text-[#64748B] text-sm">
              <strong className="text-[#0F172A]">Note:</strong> Some
              jurisdictions do not allow the limitation or exclusion of
              liability for incidental or consequential damages. If you reside
              in such a jurisdiction, some of the above limitations may not
              apply to you, and you may have additional rights under local law.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Mail size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            If you have questions, concerns, or disputes regarding these Terms
            of Service, please contact us:
          </p>

          <div className="bg-gradient-to-br from-[#EAF2FF] to-[#E6FFE8] p-8 rounded-3xl mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-[#D7F50A]" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#64748B] mb-1">
                      General Support:
                    </p>
                    <a
                      href="mailto:support@focuse.rakriai.com"
                      className="text-[#0F172A] font-medium hover:text-blue-600 transition-colors"
                    >
                      himanshu@rakriai.com
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#0F172A] mb-4">
                  Company Details
                </h4>
                <div className="space-y-2 text-sm text-[#64748B]">
                  <p>
                    <strong className="text-[#0F172A]">Company Name:</strong>
                    <br />
                    RakrAI Technologies Private Limited
                  </p>
                  <p>
                    <strong className="text-[#0F172A]">Product:</strong>
                    <br />
                    Focuse - AI-Powered Focus Timer
                  </p>
                  <p>
                    <strong className="text-[#0F172A]">Website:</strong>
                    <br />
                    <a
                      href="https://focuse.rakriai.com"
                      className="text-blue-600 hover:underline"
                    >
                      https://focuse.rakriai.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#CBD5E1]">
              <h4 className="font-semibold text-[#0F172A] mb-3">
                Dispute Resolution
              </h4>
              <p className="text-[#64748B] text-sm mb-3">
                We encourage you to contact us first to resolve any disputes
                informally. If we cannot resolve a dispute through informal
                means, any legal action must be brought in the courts of
                Bangalore, Karnataka, India, and you consent to the exclusive
                jurisdiction of such courts.
              </p>
              <p className="text-[#64748B] text-sm">
                These Terms shall be governed by and construed in accordance
                with the laws of India, without regard to conflict of law
                principles.
              </p>
            </div>
          </div>

          <div className="bg-[#0F172A] text-white rounded-2xl p-6 mt-6">
            <h4 className="font-semibold mb-2">
              Severability and Entire Agreement
            </h4>
            <p className="text-gray-300 text-sm mb-3">
              If any provision of these Terms is found to be unenforceable or
              invalid, that provision will be limited or eliminated to the
              minimum extent necessary, and the remaining provisions will remain
              in full force and effect.
            </p>
            <p className="text-gray-300 text-sm">
              These Terms, along with our Privacy Policy, constitute the entire
              agreement between you and RakrAI Technologies Private Limited
              regarding the use of Focuse and supersede any prior agreements.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
      <Navigation
        userTier={userProfile?.subscriptionTier}
        userName={userProfile?.name}
        userAvatar={userProfile?.avatar}
        userId={userProfile?.id}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-5 pt-24 pb-12 lg:pt-32">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm">
            <FileText size={16} className="text-[#D7F50A]" />
            <span className="text-sm font-medium text-[#0F172A]">
              Legal Agreement
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-3">
            Please read these terms carefully before using Focuse
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[#94A3B8]">
            <span>
              Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Effective date:{' '}
              <time dateTime={effectiveDate}>{effectiveDate}</time>
            </span>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <p className="text-[#64748B] leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of Focuse, an
              AI-powered focus timer and productivity platform operated by
              RakrAI Technologies Private Limited. By accessing or using our
              Services, you agree to be bound by these Terms.
            </p>
            <p className="text-[#64748B] leading-relaxed">
              Please read these Terms carefully. If you do not agree with any
              part of these Terms, you must not use our Services. We recommend
              printing or saving a copy of these Terms for your records.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Table of Contents - Sticky Sidebar */}
          <motion.aside
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="lg:sticky lg:top-24 bg-white rounded-3xl p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <h3 className="font-semibold text-[#0F172A] mb-4">
                Quick Navigation
              </h3>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-all ${
                      activeSection === item.id
                        ? 'bg-[#D7F50A] text-[#0F172A] font-medium'
                        : 'text-[#64748B] hover:bg-[#F6F9FF] hover:text-[#0F172A]'
                    }`}
                    aria-label={`Navigate to ${item.title}`}
                  >
                    <span
                      className={
                        activeSection === item.id
                          ? 'text-[#0F172A]'
                          : 'text-[#94A3B8]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  data-section={section.id}
                  className="bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)] scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">
                      {section.title}
                    </h2>
                  </div>
                  {section.content}
                </div>
              ))}
            </div>

            {/* Acknowledgment */}
            <div className="bg-gradient-to-r from-[#D7F50A] to-[#E9FF6A] rounded-3xl p-8 mt-8">
              <h3 className="text-xl font-semibold text-[#0F172A] mb-4">
                Acknowledgment
              </h3>
              <p className="text-[#0F172A] mb-4">
                By using Focuse, you acknowledge that you have read these Terms
                of Service and agree to be bound by them. These Terms apply to
                all users of the Services, including visitors, registered users,
                and subscribers.
              </p>
              <p className="text-[#0F172A] text-sm">
                Thank you for choosing Focuse to improve your productivity.
                We're committed to providing you with the best possible
                experience.
              </p>
            </div>
          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
