import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Polly
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create engaging polls, gather opinions, and make data-driven decisions. 
            Share your polls with the world and see real-time results.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/polls">
              <Button size="lg">
                Browse Polls
              </Button>
            </Link>
            <Link href="/polls/new">
              <Button variant="outline" size="lg">
                Create Poll
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6">
            <div className="text-3xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold mb-2">Easy Voting</h3>
            <p className="text-muted-foreground">
              Simple and intuitive interface for creating and participating in polls
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
            <p className="text-muted-foreground">
              See voting results update in real-time as participants cast their votes
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground">
              Share your polls via direct links and gather responses from anywhere
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-accent/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of users who are already creating amazing polls with Polly
          </p>
          <Link href="/auth">
            <Button size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
