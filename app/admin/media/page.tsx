import CloudinaryUploader from '@/components/CloudinaryUploader';

export const metadata = {
  title: 'Media Manager | Sahajshakti',
  robots: { index: false, follow: false }
};

export default function MediaAdminPage() {
  return <CloudinaryUploader />;
}
