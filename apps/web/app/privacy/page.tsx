'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Cookie,
  Users,
  Mail,
  AlertCircle,
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

export default function PrivacyPage() {
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

  const tableOfContents = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: <Database size={18} />,
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: <Eye size={18} />,
    },
    { id: 'data-security', title: 'Data Security', icon: <Lock size={18} /> },
    { id: 'cookies', title: 'Cookies & Tracking', icon: <Cookie size={18} /> },
    { id: 'data-sharing', title: 'Data Sharing', icon: <Users size={18} /> },
    { id: 'your-rights', title: 'Your Rights', icon: <Shield size={18} /> },
    { id: 'contact', title: 'Contact Us', icon: <Mail size={18} /> },
  ];

  const sections: Section[] = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: <Database size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            We collect information to provide, improve, and protect our
            services. The types of information we collect include:
          </p>

          <div className="space-y-6 mt-6">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                1. Account Information
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
                <li>Name and email address (required for account creation)</li>
                <li>Profile picture (optional)</li>
                <li>Password (encrypted and never stored in plain text)</li>
                <li>Subscription tier and billing information</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                2. Usage Data
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
                <li>
                  Focus session data (duration, completion status, timestamps)
                </li>
                <li>
                  Task information (titles, descriptions, completion status)
                </li>
                <li>Forest growth and tree collection data</li>
                <li>Productivity insights and analytics</li>
                <li>Feature usage patterns and preferences</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                3. Device & Technical Information
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
                <li>
                  IP address and approximate location (for security and
                  analytics)
                </li>
                <li>Browser type and version</li>
                <li>Device type, operating system, and screen resolution</li>
                <li>Referring URLs and pages visited</li>
                <li>Time spent on pages and interaction data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                4. AI Interaction Data
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
                <li>
                  Queries sent to Chitra AI for task breakdown and insights
                </li>
                <li>AI-generated suggestions and recommendations</li>
                <li>Feedback on AI responses (to improve our models)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                5. Payment Information
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-4">
                <li>
                  Payment processing is handled by Razorpay (PCI-DSS compliant)
                </li>
                <li>We do not store your credit card details</li>
                <li>We retain transaction records and payment status</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: <Eye size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            We use the information we collect for the following purposes:
          </p>

          <div className="space-y-4 mt-6">
            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  1
                </div>
                Service Delivery & Improvement
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-12">
                <li>Provide core focus timer and task management features</li>
                <li>Generate AI-powered insights and recommendations</li>
                <li>Sync your data across devices</li>
                <li>Improve our algorithms and user experience</li>
              </ul>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                  2
                </div>
                Account Management
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-12">
                <li>Create and manage your account</li>
                <li>Process subscription payments and renewals</li>
                <li>Send transactional emails (receipts, password resets)</li>
                <li>Provide customer support</li>
              </ul>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-semibold text-sm">
                  3
                </div>
                Communication
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-12">
                <li>Send important service updates and announcements</li>
                <li>Notify you about new features and improvements</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send marketing emails (you can opt-out anytime)</li>
              </ul>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                  4
                </div>
                Security & Fraud Prevention
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-12">
                <li>Detect and prevent fraudulent activities</li>
                <li>Monitor for security threats and vulnerabilities</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect our platform and users</li>
              </ul>
            </div>

            <div className="bg-[#F6F9FF] p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
                  5
                </div>
                Analytics & Research
              </h4>
              <ul className="list-disc list-inside space-y-2 text-[#64748B] ml-12">
                <li>Analyze usage patterns and trends</li>
                <li>Conduct A/B testing for feature improvements</li>
                <li>Generate aggregated, anonymized statistics</li>
                <li>Improve our AI models and algorithms</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            We take the security of your data seriously and implement
            industry-standard measures to protect your information:
          </p>

          <div className="space-y-4 mt-6">
            <div className="border-l-4 border-green-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">Encryption</h4>
              <p className="text-[#64748B]">
                All data transmitted between your device and our servers is
                encrypted using TLS 1.3 (Transport Layer Security). Passwords
                are hashed using bcrypt with salt.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Access Controls
              </h4>
              <p className="text-[#64748B]">
                Access to user data is strictly limited to authorized personnel
                who require it for service operations. We use role-based access
                controls and multi-factor authentication for all internal
                systems.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Infrastructure Security
              </h4>
              <p className="text-[#64748B]">
                Our infrastructure is hosted on secure, enterprise-grade cloud
                providers with 24/7 monitoring, regular security audits, and
                automatic backups.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Regular Audits
              </h4>
              <p className="text-[#64748B]">
                We conduct regular security audits, vulnerability assessments,
                and penetration testing to identify and address potential
                security issues.
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Incident Response
              </h4>
              <p className="text-[#64748B]">
                We have an incident response plan in place to quickly address
                any security breaches. In the event of a data breach affecting
                your information, we will notify you within 72 hours.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-yellow-600 flex-shrink-0 mt-1"
              />
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-2">
                  Your Responsibility
                </h4>
                <p className="text-[#64748B] text-sm">
                  While we implement robust security measures, no system is 100%
                  secure. Please use a strong, unique password and enable
                  two-factor authentication (when available). Never share your
                  login credentials with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies & Tracking Technologies',
      icon: <Cookie size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            We use cookies and similar tracking technologies to enhance your
            experience and collect usage data:
          </p>

          <div className="space-y-4 mt-6">
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Essential Cookies
              </h4>
              <p className="text-[#64748B] mb-2">
                Required for the website to function properly. These cookies
                enable core functionalities like authentication, security, and
                session management.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Authentication tokens (access and refresh tokens)</li>
                <li>Session management</li>
                <li>Security and fraud prevention</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Analytics Cookies
              </h4>
              <p className="text-[#64748B] mb-2">
                Help us understand how visitors interact with our website by
                collecting and reporting information anonymously.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Page views and navigation patterns</li>
                <li>Time spent on pages</li>
                <li>Browser and device information</li>
                <li>Referral sources</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Preference Cookies
              </h4>
              <p className="text-[#64748B] mb-2">
                Remember your preferences and settings for a personalized
                experience.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Theme preferences (light/dark mode)</li>
                <li>Language settings</li>
                <li>Focus session preferences</li>
                <li>Ambient sound selections</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Marketing Cookies
              </h4>
              <p className="text-[#64748B] mb-2">
                Track your activity across websites to deliver relevant
                advertisements and measure campaign effectiveness.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>Google Analytics for traffic analysis</li>
                <li>Social media pixels (if applicable)</li>
                <li>Advertising partners (if applicable)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
            <h4 className="font-semibold text-[#0F172A] mb-2">
              Managing Cookies
            </h4>
            <p className="text-[#64748B] text-sm mb-3">
              You can control and delete cookies through your browser settings.
              However, disabling certain cookies may affect the functionality of
              our website.
            </p>
            <p className="text-[#64748B] text-sm">
              Most browsers allow you to: view cookies stored on your device,
              block third-party cookies, block cookies from specific websites,
              block all cookies, and delete all cookies when you close the
              browser.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing & Third Parties',
      icon: <Users size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            We do not sell your personal information. We only share your data in
            the following circumstances:
          </p>

          <div className="space-y-4 mt-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Service Providers
              </h4>
              <p className="text-[#64748B] text-sm mb-3">
                We work with trusted third-party service providers who assist us
                in operating our platform:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm">
                <li>
                  <strong>Payment Processing:</strong> Razorpay (PCI-DSS
                  compliant) for secure payment processing
                </li>
                <li>
                  <strong>Email Services:</strong> For transactional and
                  marketing emails
                </li>
                <li>
                  <strong>Cloud Hosting:</strong> For data storage and
                  application hosting
                </li>
                <li>
                  <strong>Analytics:</strong> Google Analytics for usage
                  analytics (anonymized)
                </li>
                <li>
                  <strong>AI Services:</strong> Third-party AI providers for
                  Chitra AI functionality
                </li>
              </ul>
              <p className="text-[#64748B] text-sm mt-3">
                All service providers are contractually obligated to protect
                your data and use it only for specified purposes.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Legal Requirements
              </h4>
              <p className="text-[#64748B] text-sm">
                We may disclose your information if required by law, court
                order, or government regulation, or if we believe disclosure is
                necessary to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#64748B] ml-4 text-sm mt-2">
                <li>Comply with legal obligations</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or security threats</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Business Transfers
              </h4>
              <p className="text-[#64748B] text-sm">
                In the event of a merger, acquisition, or sale of assets, your
                information may be transferred to the new entity. We will notify
                you via email and update this Privacy Policy before any transfer
                occurs.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Aggregated Data
              </h4>
              <p className="text-[#64748B] text-sm">
                We may share aggregated, anonymized statistics about our users,
                traffic patterns, and usage trends. This data cannot be used to
                identify individual users.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'your-rights',
      title: 'Your Rights & Choices',
      icon: <Shield size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            You have the following rights regarding your personal information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Access Your Data
              </h4>
              <p className="text-[#64748B] text-sm">
                Request a copy of all personal data we hold about you. We'll
                provide it in a structured, machine-readable format.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Correct Your Data
              </h4>
              <p className="text-[#64748B] text-sm">
                Update or correct inaccurate information in your profile
                settings at any time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Delete Your Data
              </h4>
              <p className="text-[#64748B] text-sm">
                Request deletion of your account and associated data. Some data
                may be retained for legal compliance.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Export Your Data
              </h4>
              <p className="text-[#64748B] text-sm">
                Download your focus sessions, tasks, and forest data in CSV or
                JSON format (PRO feature).
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Opt-Out of Marketing
              </h4>
              <p className="text-[#64748B] text-sm">
                Unsubscribe from marketing emails by clicking the unsubscribe
                link in any email or updating your preferences.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-2">
                Restrict Processing
              </h4>
              <p className="text-[#64748B] text-sm">
                Request that we limit how we use your data while you contest the
                accuracy or legality of processing.
              </p>
            </div>
          </div>

          <div className="bg-[#0F172A] text-white rounded-2xl p-6 mt-6">
            <h4 className="font-semibold mb-3">How to Exercise Your Rights</h4>
            <p className="text-gray-300 text-sm mb-4">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:privacy@focuse.rakriai.com"
                className="text-[#D7F50A] hover:underline"
              >
                privacy@focuse.rakriai.com
              </a>
              . We'll respond within 30 days.
            </p>
            <p className="text-gray-400 text-xs">
              We may request additional information to verify your identity
              before processing requests that involve accessing or deleting
              personal data.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: <Mail size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#64748B] leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy
            Policy or your personal data, please contact us:
          </p>

          <div className="bg-gradient-to-br from-[#EAF2FF] to-[#E6FFE8] p-8 rounded-3xl mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-[#D7F50A]" />
                  Email Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#64748B] mb-1">
                      General Privacy Inquiries:
                    </p>
                    <a
                      href="mailto:privacy@focuse.rakriai.com"
                      className="text-[#0F172A] font-medium hover:text-blue-600 transition-colors"
                    >
                      himanshu@rakriai.com
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#0F172A] mb-4">
                  Response Times
                </h4>
                <ul className="space-y-3 text-sm text-[#64748B]">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>General inquiries: Within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Data access requests: Within 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Data deletion requests: Within 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Security concerns: Within 24 hours</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#CBD5E1]">
              <p className="text-sm text-[#64748B]">
                <strong className="text-[#0F172A]">Company Information:</strong>{' '}
                Focuse by RakrAI
              </p>
              <p className="text-sm text-[#64748B] mt-2">
                We are committed to protecting your privacy and will respond to
                all legitimate requests in accordance with applicable data
                protection laws.
              </p>
            </div>
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
            <Shield size={16} className="text-[#D7F50A]" />
            <span className="text-sm font-medium text-[#0F172A]">
              Your Privacy Matters
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-3">
            We are committed to protecting your personal information and your
            right to privacy
          </p>
          <p className="text-sm text-[#94A3B8]">
            Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
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
              Welcome to Focuse, an AI-powered focus timer and productivity
              platform. This Privacy Policy explains how RakrAI Technologies
              Private Limited ("we," "us," or "our") collects, uses, discloses,
              and safeguards your information when you use our website and
              services.
            </p>
            <p className="text-[#64748B] leading-relaxed">
              By using Focuse, you agree to the collection and use of
              information in accordance with this policy. If you do not agree
              with our policies and practices, please do not use our services.
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
                    <span className="flex-1">{item.title}</span>
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

            {/* Additional Information */}
            <div className="bg-[#0F172A] text-white rounded-3xl p-8 mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Changes to This Privacy Policy
              </h3>
              <p className="text-gray-300 mb-4">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or
                other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-4">
                <li>
                  Posting the updated policy on this page with a new "Last
                  Updated" date
                </li>
                <li>
                  Sending an email notification to your registered email address
                </li>
                <li>
                  Displaying a prominent notice on our website or dashboard
                </li>
              </ul>
              <p className="text-gray-400 text-sm">
                Your continued use of Focuse after any changes indicates your
                acceptance of the updated Privacy Policy. We encourage you to
                review this page periodically to stay informed about how we
                protect your information.
              </p>
            </div>
          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
