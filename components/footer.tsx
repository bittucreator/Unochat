import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">
              Tool<span className="text-primary">iQ</span>
            </h3>
            <p className="text-muted-foreground">
              Transform websites to Figma designs and Next.js code with powerful customization options.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/figma-converter" className="text-muted-foreground hover:text-foreground">
                  Figma Converter
                </Link>
              </li>
              <li>
                <Link href="/nextjs-generator" className="text-muted-foreground hover:text-foreground">
                  Next.js Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TooliQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
