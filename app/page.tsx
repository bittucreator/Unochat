import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Palette, Figma } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
          Transform Websites with TooliQ
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
          Convert any website to Figma designs or Next.js code with just a few clicks. Built for designers and
          developers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/figma-converter">
              Try Figma Converter <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/nextjs-generator">
              Try Next.js Generator <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 md:mb-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Powerful Features for Your Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="mb-4 bg-primary/10 w-fit p-3 rounded-full">
              <Figma className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Website to Figma</h3>
            <p className="text-muted-foreground">
              Automatically extract website elements and convert them to editable Figma components with accurate styling
              and layout.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="mb-4 bg-primary/10 w-fit p-3 rounded-full">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Website to Next.js</h3>
            <p className="text-muted-foreground">
              Generate clean, well-structured Next.js code with Tailwind CSS from any website, ready for customization
              and deployment.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="mb-4 bg-primary/10 w-fit p-3 rounded-full">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Design Customization</h3>
            <p className="text-muted-foreground">
              Customize fonts, color palettes, and other design elements to match your brand or personal preferences.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 md:p-12 bg-card rounded-xl border text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
        <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
          Start converting websites to Figma designs or Next.js code today. No sign-up required to try it out.
        </p>
        <Button asChild size="lg">
          <Link href="/figma-converter">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  )
}
