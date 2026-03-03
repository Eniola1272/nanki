import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";

// Define props interface
interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Create and Share Quizzes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Build engaging quizzes, challenge your friends, and track results. 
            Perfect for teachers, teams, and trivia nights.
          </p>
          
          <div className="flex gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg">Get Started</Button>
              </Link>
            )}
            <Link href="/quiz/public">
              <Button size="lg" variant="outline">Try a Demo Quiz</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard 
              title="Create Quizzes"
              description="Build custom quizzes with multiple choice questions"
            />
            <FeatureCard 
              title="Share Instantly"
              description="Share unique links with anyone, anywhere"
            />
            <FeatureCard 
              title="Track Results"
              description="See who took your quiz and how they scored"
            />
          </div>
        </div>
      </main>
    </>
  );
}