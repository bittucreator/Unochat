import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 amie-gradient-text">Transform Websites with TooliQ</h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Convert any website to Figma designs or Next.js code with just a few clicks. Built for designers and
            developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="amie-button gap-2 px-8 py-6 text-lg">
              <Link href="/login">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="amie-button gap-2 px-8 py-6 text-lg">
              <Link href="/pricing">
                View Pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-20 bottom-0 top-auto"></div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-border">
            <img
              src="/placeholder.svg?height=600&width=1200"
              alt="TooliQ Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section className="mb-16 md:mb-24 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform websites into design assets and code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="amie-card p-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Pixel-Perfect Designs</h3>
            <p className="text-muted-foreground">
              Convert websites to Figma designs with accurate styling, components, and layout. Edit and customize to
              match your brand.
            </p>
          </div>

          <div className="amie-card p-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Clean Code Generation</h3>
            <p className="text-muted-foreground">
              Generate production-ready Next.js code with Tailwind CSS from any website. Customize frameworks, styling,
              and components.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:p-16 amie-card text-center max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to boost your productivity?</h2>
        <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
          Start converting websites to Figma designs or Next.js code today. Sign up for free and upgrade anytime.
        </p>
        <Button asChild size="lg" className="amie-button gap-2 px-8 py-6 text-lg">
          <Link href="/login">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  )
}
