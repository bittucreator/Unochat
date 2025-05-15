import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Book, Code, FileText, Lightbulb, Video } from "lucide-react"

export default function DocumentationPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of TooliQ and how to set up your first conversion",
      icon: <Book className="h-6 w-6" />,
      link: "/documentation/getting-started",
    },
    {
      title: "Figma Converter",
      description: "Learn how to convert websites to Figma designs",
      icon: <FileText className="h-6 w-6" />,
      link: "/documentation/figma-converter",
    },
    {
      title: "Next.js Generator",
      description: "Learn how to generate Next.js code from websites",
      icon: <Code className="h-6 w-6" />,
      link: "/documentation/nextjs-generator",
    },
    {
      title: "API Reference",
      description: "Explore the TooliQ API and integrate with your applications",
      icon: <Code className="h-6 w-6" />,
      link: "/documentation/api",
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides for common use cases",
      icon: <Video className="h-6 w-6" />,
      link: "/documentation/tutorials",
    },
    {
      title: "Best Practices",
      description: "Tips and tricks for getting the most out of TooliQ",
      icon: <Lightbulb className="h-6 w-6" />,
      link: "/documentation/best-practices",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to know about using TooliQ to convert websites to Figma designs and Next.js code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.link}
            className="amie-card p-6 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              {category.icon}
            </div>
            <h2 className="text-xl font-bold mb-2">{category.title}</h2>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <Button variant="ghost" className="group p-0 h-auto">
              Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <div className="amie-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="amie-button">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild className="amie-button">
              <Link href="https://github.com/tooliq/tooliq/issues" target="_blank" rel="noopener noreferrer">
                GitHub Issues
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
