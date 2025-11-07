import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ダッシュボードにリダイレクト
    router.push('/dashboard');
  }, [router]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">リダイレクト中...</div>
      </div>
    </Layout>
  );
}
