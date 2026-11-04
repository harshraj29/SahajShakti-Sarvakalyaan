import CloudinaryUploader from '@/components/CloudinaryUploader';
import AdminLogin from '@/components/AdminLogin';
import { adminConfigured, isAdmin } from '@/lib/auth';

export const metadata = {
  title: 'Media Manager | Sahajshakti',
  robots: { index: false, follow: false }
};

// The session cookie must be read on every request.
export const dynamic = 'force-dynamic';

export default async function MediaAdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }
  return <CloudinaryUploader />;
}
