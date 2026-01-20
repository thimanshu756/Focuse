import { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata.forest;

export default function ForestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
