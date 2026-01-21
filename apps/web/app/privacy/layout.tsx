import { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata.privacy;

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
