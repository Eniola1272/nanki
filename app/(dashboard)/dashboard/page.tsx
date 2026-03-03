import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Quiz } from "@prisma/client";

// Define props interfaces
interface WelcomeCardProps {
  name: string;
  email: string;
  isPremium: boolean;
}

interface RecentQuizzesProps {
  quizzes: Quiz[];
}

function WelcomeCard({ name, email, isPremium }: WelcomeCardProps) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Welcome, {name}!</h2>
      <div className="space-y-2 text-muted-foreground">
        <p>Email: {email}</p>
        <p>Account Type: <span className={isPremium ? "text-purple-600 font-semibold" : ""}>
          {isPremium ? "✨ Premium" : "Free"}
        </span></p>
      </div>
    </div>
  );
}

function RecentQuizzes({ quizzes }: RecentQuizzesProps) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Quizzes</h2>
      {quizzes.length > 0 ? (
        <ul className="space-y-2">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="border-b pb-2 flex justify-between">
              <span>{quiz.title}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(quiz.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          You haven't created any quizzes yet.{' '}
          <Link href="/quiz/create" className="text-blue-600 hover:underline">
            Create your first quiz
          </Link>
        </p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userQuizzes = await prisma.quiz.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/quiz/create">
            <Button>Create New Quiz</Button>
          </Link>
        </div>
        
        <div className="grid gap-6">
          <WelcomeCard 
            name={session.user.name || "User"} 
            email={session.user.email || ""} 
            isPremium={session.user.isPremium} 
          />
          
          <RecentQuizzes quizzes={userQuizzes} />
        </div>
      </main>
    </>
  );
}