import StickDetailClient from './StickDetailClient';
import { getStickById } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StickDetailPage({ params }: PageProps) {
  const { id } = await params;
  const stick = await getStickById(parseInt(id, 10));
  return <StickDetailClient initialStick={stick || null} />;
}
