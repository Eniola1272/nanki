'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define props interface
interface PremiumGuardProps {
  children: ReactNode;
  feature: 'organization' | 'advanced-analytics' | 'custom-branding';
  fallback?: ReactNode;
}

export function PremiumGuard({ children, feature, fallback }: PremiumGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session?.user?.isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureMessages: Record<PremiumGuardProps['feature'], string> = {
    organization: 'Create and manage team organizations',
    'advanced-analytics': 'Access detailed quiz analytics',
    'custom-branding': 'Add your own branding to quizzes',
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Premium Feature</CardTitle>
        <CardDescription>
          {featureMessages[feature]} is available with Premium plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Upgrade to Premium to unlock this and other advanced features.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button onClick={() => router.push('/pricing')}>
          View Plans
        </Button>
      </CardFooter>
    </Card>
  );
}