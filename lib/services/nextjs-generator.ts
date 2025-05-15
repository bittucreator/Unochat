import type { GeneratedFile, NextjsGenerationOptions, WebsiteAnalysisResult, WebsiteElement } from "../types/nextjs"

export async function generateNextjsCode(
  analysisResult: WebsiteAnalysisResult,
  options: NextjsGenerationOptions,
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = []

  // Generate files based on the framework option
  if (options.framework === "nextjs-app") {
    files.push(...generateNextjsAppFiles(analysisResult, options))
  } else if (options.framework === "nextjs-pages") {
    files.push(...generateNextjsPagesFiles(analysisResult, options))
  } else {
    files.push(...generateReactFiles(analysisResult, options))
  }

  return files
}

function generateNextjsAppFiles(
  analysisResult: WebsiteAnalysisResult,
  options: NextjsGenerationOptions,
): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileExt = options.useTypeScript ? "tsx" : "jsx"

  // Generate layout file
  files.push({
    path: `app/layout.${fileExt}`,
    content: generateLayoutFile(analysisResult, options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate page file
  files.push({
    path: `app/page.${fileExt}`,
    content: generatePageFile(analysisResult, options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate component files
  files.push(...generateComponentFiles(analysisResult, options))

  // Generate CSS files
  if (options.cssFramework === "tailwind") {
    files.push({
      path: "app/globals.css",
      content: generateGlobalCss(options),
      type: "css",
    })

    files.push({
      path: "tailwind.config.js",
      content: generateTailwindConfig(options),
      type: "js",
    })
  } else if (options.cssFramework === "css-modules") {
    files.push({
      path: "app/globals.css",
      content: generateGlobalCss(options),
      type: "css",
    })
  }

  // Generate API route handlers if enabled
  if (options.useRouteHandlers) {
    files.push({
      path: `app/api/contact/route.${options.useTypeScript ? "ts" : "js"}`,
      content: generateContactRouteHandler(options),
      type: options.useTypeScript ? "ts" : "js",
    })
  }

  return files
}

function generateNextjsPagesFiles(
  analysisResult: WebsiteAnalysisResult,
  options: NextjsGenerationOptions,
): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileExt = options.useTypeScript ? "tsx" : "jsx"

  // Generate _app file
  files.push({
    path: `pages/_app.${fileExt}`,
    content: generateAppFile(options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate _document file
  files.push({
    path: `pages/_document.${fileExt}`,
    content: generateDocumentFile(options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate index file
  files.push({
    path: `pages/index.${fileExt}`,
    content: generateIndexFile(analysisResult, options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate component files
  files.push(...generateComponentFiles(analysisResult, options))

  // Generate CSS files
  if (options.cssFramework === "tailwind") {
    files.push({
      path: "styles/globals.css",
      content: generateGlobalCss(options),
      type: "css",
    })

    files.push({
      path: "tailwind.config.js",
      content: generateTailwindConfig(options),
      type: "js",
    })
  } else if (options.cssFramework === "css-modules") {
    files.push({
      path: "styles/globals.css",
      content: generateGlobalCss(options),
      type: "css",
    })
  }

  // Generate API routes if enabled
  if (options.useRouteHandlers) {
    files.push({
      path: `pages/api/contact.${options.useTypeScript ? "ts" : "js"}`,
      content: generateContactApiHandler(options),
      type: options.useTypeScript ? "ts" : "js",
    })
  }

  return files
}

function generateReactFiles(analysisResult: WebsiteAnalysisResult, options: NextjsGenerationOptions): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileExt = options.useTypeScript ? "tsx" : "jsx"

  // Generate App file
  files.push({
    path: `src/App.${fileExt}`,
    content: generateReactAppFile(analysisResult, options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate index file
  files.push({
    path: `src/index.${fileExt}`,
    content: generateReactIndexFile(options),
    type: options.useTypeScript ? "tsx" : "jsx",
  })

  // Generate component files
  files.push(...generateReactComponentFiles(analysisResult, options))

  // Generate CSS files
  if (options.cssFramework === "tailwind") {
    files.push({
      path: "src/index.css",
      content: generateGlobalCss(options),
      type: "css",
    })

    files.push({
      path: "tailwind.config.js",
      content: generateTailwindConfig(options),
      type: "js",
    })
  } else if (options.cssFramework === "css-modules") {
    files.push({
      path: "src/index.css",
      content: generateGlobalCss(options),
      type: "css",
    })
  }

  return files
}

// Helper functions to generate specific files
function generateLayoutFile(analysisResult: WebsiteAnalysisResult, options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"
  const typeImports = useTypeScript
    ? "import type { Metadata } from 'next';\nimport type { ReactNode } from 'react';\n"
    : ""

  return `${clientDirective}${typeImports}import './globals.css';

export const metadata${useTypeScript ? ": Metadata" : ""} = {
  title: '${analysisResult.title}',
  description: '${analysisResult.description}',
};

export default function RootLayout({
  children,
}${useTypeScript ? ": { children: ReactNode }" : ""}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
`
}

function generatePageFile(analysisResult: WebsiteAnalysisResult, options: NextjsGenerationOptions): string {
  const { useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  // Import components
  let imports = ""
  if (analysisResult.structure.header) {
    imports += "import Header from '@/components/header';\n"
  }
  if (analysisResult.structure.footer) {
    imports += "import Footer from '@/components/footer';\n"
  }

  // Import section components
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    imports += `import ${sectionName} from '@/components/${sectionName.toLowerCase()}';\n`
  })

  // Generate page content
  let content = `${clientDirective}${imports}
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
`

  if (analysisResult.structure.header) {
    content += "      <Header />\n"
  }

  content += '      <main className="flex-grow">\n'

  // Add sections
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    content += `        <${sectionName} />\n`
  })

  content += "      </main>\n"

  if (analysisResult.structure.footer) {
    content += "      <Footer />\n"
  }

  content += `    </div>
  );
}
`

  return content
}

function getSectionComponentName(section: WebsiteElement, index: number): string {
  if (section.className) {
    // Convert kebab-case or snake_case to PascalCase
    const className = section.className
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
      .replace(/Section$/, "")

    return `${className}Section`
  }

  // Fallback to generic section name
  return `Section${index + 1}`
}

function generateComponentFiles(
  analysisResult: WebsiteAnalysisResult,
  options: NextjsGenerationOptions,
): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileExt = options.useTypeScript ? "tsx" : "jsx"

  // Generate header component if it exists
  if (analysisResult.structure.header) {
    files.push({
      path: `components/header.${fileExt}`,
      content: generateHeaderComponent(analysisResult.structure.header, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  }

  // Generate footer component if it exists
  if (analysisResult.structure.footer) {
    files.push({
      path: `components/footer.${fileExt}`,
      content: generateFooterComponent(analysisResult.structure.footer, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  }

  // Generate section components
  analysisResult.structure.sections.forEach((section, index) => {
    const componentName = getSectionComponentName(section, index).toLowerCase()
    files.push({
      path: `components/${componentName}.${fileExt}`,
      content: generateSectionComponent(section, componentName, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  })

  return files
}

function generateHeaderComponent(header: WebsiteElement, options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  // Check if header contains navigation
  const hasNavigation = header.children?.some((child) => child.type === "navigation")

  let content = `${clientDirective}import Link from '${options.framework === "react" ? "react-router-dom" : "next/link"}';\n`

  if (hasNavigation) {
    content += "import { useState } from 'react';\n"
  }

  content += `
export default function Header() {
`

  if (hasNavigation) {
    content += `  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

`
  }

  content += `  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">
            ${analysisResult.title.split(" ")[0] || "Logo"}
          </Link>
        </div>
`

  if (hasNavigation) {
    content += `
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-white">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
        </div>
      )}
`
  } else {
    content += `      </div>\n`
  }

  content += `    </header>
  );
}
`

  return content
}

function generateFooterComponent(footer: WebsiteElement, options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  return `${clientDirective}import Link from '${options.framework === "react" ? "react-router-dom" : "next/link"}';\n
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">${analysisResult.title.split(" ")[0] || "Company"}</h3>
            <p className="text-gray-300">
              We provide the best services for our customers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white">Services</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="text-gray-300 not-italic">
              <p>123 Street Name</p>
              <p>City, Country</p>
              <p>Email: info@example.com</p>
              <p>Phone: +1 234 567 890</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} ${analysisResult.title.split(" ")[0] || "Company"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`
}

function generateSectionComponent(
  section: WebsiteElement,
  componentName: string,
  options: NextjsGenerationOptions,
): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  // Determine section type based on className or children
  let sectionType = "generic"

  if (section.className?.includes("hero")) {
    sectionType = "hero"
  } else if (section.className?.includes("feature")) {
    sectionType = "features"
  } else if (section.className?.includes("testimonial")) {
    sectionType = "testimonials"
  } else if (section.className?.includes("contact")) {
    sectionType = "contact"
  } else if (section.children?.some((child) => child.tag === "form")) {
    sectionType = "contact"
  }

  // Generate component based on section type
  switch (sectionType) {
    case "hero":
      return generateHeroSection(options)
    case "features":
      return generateFeaturesSection(options)
    case "testimonials":
      return generateTestimonialsSection(options)
    case "contact":
      return generateContactSection(options)
    default:
      return generateGenericSection(section, componentName, options)
  }
}

function generateHeroSection(options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  return `${clientDirective}
export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-${options.primaryColor.replace("#", "")} to-${options.secondaryColor.replace("#", "")} text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Our Website</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          We provide the best services for our customers. Discover how we can help you achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-${options.primaryColor.replace("#", "")} px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Get Started
          </button>
          <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
`
}

function generateFeaturesSection(options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  return `${clientDirective}
export default function FeaturesSection() {
  const features = [
    {
      title: "Feature 1",
      description: "Description of feature 1. This feature provides great value to users.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Feature 2",
      description: "Description of feature 2. This feature helps users accomplish their goals.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Feature 3",
      description: "Description of feature 3. This feature enhances the user experience.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the amazing features that make our service stand out from the competition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`
}

function generateTestimonialsSection(options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"

  return `${clientDirective}
export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This service has completely transformed our business. The features are exactly what we needed.",
      author: "John Doe",
      position: "CEO, Company A",
    },
    {
      quote: "The team was incredibly helpful and the product exceeded our expectations.",
      author: "Jane Smith",
      position: "Marketing Director, Company B",
    },
    {
      quote: "I can't imagine running my business without this service now. It's been a game-changer.",
      author: "Robert Johnson",
      position: "Founder, Company C",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about our services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4 text-${options.primaryColor.replace("#", "")}">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{testimonial.quote}</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`
}

function generateContactSection(options: NextjsGenerationOptions): string {
  const { useTypeScript, useServerComponents, useRouteHandlers } = options
  const clientDirective = "'use client';\n\n"

  let imports = ""
  let formState = ""
  let handleSubmit = ""

  if (useRouteHandlers) {
    imports = "import { useState } from 'react';\n\n"

    formState = `  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

`

    handleSubmit = `  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Message sent successfully!' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus({ success: false, message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

`
  }

  return `${clientDirective}${imports}export default function ContactSection() {
${formState}${handleSubmit}  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or want to learn more? Get in touch with our team.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-${options.primaryColor.replace("#", "")} text-white p-8">
              <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
              <p className="mb-6">
                We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm opacity-80">123 Street Name, City, Country</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm opacity-80">info@example.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm opacity-80">+1 234 567 890</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8">
              <form ${useRouteHandlers ? "onSubmit={handleSubmit}" : ""}>
                {/* @ts-expect-error */}
                {submitStatus && (
                  <div className={\`mb-4 p-3 rounded ${submitStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}\`}>
                    {submitStatus.message}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${options.primaryColor.replace("#", "")}"
                    placeholder="Your name"
                    required
                    ${useRouteHandlers ? "value={formData.name} onChange={handleChange}" : ""}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${options.primaryColor.replace("#", "")}"
                    placeholder="Your email"
                    required
                    ${useRouteHandlers ? "value={formData.email} onChange={handleChange}" : ""}
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${options.primaryColor.replace("#", "")}"
                    placeholder="Your message"
                    required
                    ${useRouteHandlers ? "value={formData.message} onChange={handleChange}" : ""}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-${options.primaryColor.replace("#", "")} text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                  ${useRouteHandlers ? "disabled={isSubmitting}" : ""}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`
}

function generateGenericSection(
  section: WebsiteElement,
  componentName: string,
  options: NextjsGenerationOptions,
): string {
  const { useTypeScript, useServerComponents } = options
  const clientDirective = useServerComponents ? "" : "'use client';\n\n"
  const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1)

  return `${clientDirective}
export default function ${pascalCaseName}() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Section Title</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a generic section that can be customized to fit your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Content Block 1</h3>
            <p className="text-gray-600">
              This is a content block that can be customized with your own content.
              Add text, images, or other elements as needed.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Content Block 2</h3>
            <p className="text-gray-600">
              This is another content block that can be customized with your own content.
              Add text, images, or other elements as needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
`
}

function generateAppFile(options: NextjsGenerationOptions): string {
  const { useTypeScript } = options

  return `import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
`
}

function generateDocumentFile(options: NextjsGenerationOptions): string {
  const { useTypeScript } = options

  return `import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
`
}

function generateIndexFile(analysisResult: WebsiteAnalysisResult, options: NextjsGenerationOptions): string {
  // Import components
  let imports = ""
  if (analysisResult.structure.header) {
    imports += "import Header from '../components/header';\n"
  }
  if (analysisResult.structure.footer) {
    imports += "import Footer from '../components/footer';\n"
  }

  // Import section components
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    imports += `import ${sectionName} from '../components/${sectionName.toLowerCase()}';\n`
  })

  // Generate page content
  let content = `${imports}
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
`

  if (analysisResult.structure.header) {
    content += "      <Header />\n"
  }

  content += '      <main className="flex-grow">\n'

  // Add sections
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    content += `        <${sectionName} />\n`
  })

  content += "      </main>\n"

  if (analysisResult.structure.footer) {
    content += "      <Footer />\n"
  }

  content += `    </div>
  );
}
`

  return content
}

function generateReactAppFile(analysisResult: WebsiteAnalysisResult, options: NextjsGenerationOptions): string {
  // Import components
  let imports = ""
  if (analysisResult.structure.header) {
    imports += "import Header from './components/header';\n"
  }
  if (analysisResult.structure.footer) {
    imports += "import Footer from './components/footer';\n"
  }

  // Import section components
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    imports += `import ${sectionName} from './components/${sectionName.toLowerCase()}';\n`
  })

  // Generate app content
  let content = `${imports}
function App() {
  return (
    <div className="min-h-screen flex flex-col">
`

  if (analysisResult.structure.header) {
    content += "      <Header />\n"
  }

  content += '      <main className="flex-grow">\n'

  // Add sections
  analysisResult.structure.sections.forEach((section, index) => {
    const sectionName = getSectionComponentName(section, index)
    content += `        <${sectionName} />\n`
  })

  content += "      </main>\n"

  if (analysisResult.structure.footer) {
    content += "      <Footer />\n"
  }

  content += `    </div>
  );
}

export default App;
`

  return content
}

function generateReactIndexFile(options: NextjsGenerationOptions): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
}

function generateReactComponentFiles(
  analysisResult: WebsiteAnalysisResult,
  options: NextjsGenerationOptions,
): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileExt = options.useTypeScript ? "tsx" : "jsx"

  // Generate header component if it exists
  if (analysisResult.structure.header) {
    files.push({
      path: `src/components/header.${fileExt}`,
      content: generateReactHeaderComponent(analysisResult.structure.header, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  }

  // Generate footer component if it exists
  if (analysisResult.structure.footer) {
    files.push({
      path: `src/components/footer.${fileExt}`,
      content: generateReactFooterComponent(analysisResult.structure.footer, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  }

  // Generate section components
  analysisResult.structure.sections.forEach((section, index) => {
    const componentName = getSectionComponentName(section, index).toLowerCase()
    files.push({
      path: `src/components/${componentName}.${fileExt}`,
      content: generateReactSectionComponent(section, componentName, options),
      type: options.useTypeScript ? "tsx" : "jsx",
    })
  })

  return files
}

function generateReactHeaderComponent(header: WebsiteElement, options: NextjsGenerationOptions): string {
  // Similar to generateHeaderComponent but with React Router
  const { useTypeScript } = options

  // Check if header contains navigation
  const hasNavigation = header.children?.some((child) => child.type === "navigation")

  let content = `import { Link } from 'react-router-dom';\n`

  if (hasNavigation) {
    content += "import { useState } from 'react';\n"
  }

  content += `
function Header() {
`

  if (hasNavigation) {
    content += `  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

`
  }

  content += `  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">
            ${analysisResult.title.split(" ")[0] || "Logo"}
          </Link>
        </div>
`

  if (hasNavigation) {
    content += `
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          <Link to="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-white">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link to="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
        </div>
      )}
`
  } else {
    content += `      </div>\n`
  }

  content += `    </header>
  );
}

export default Header;
`

  return content
}

function generateReactFooterComponent(footer: WebsiteElement, options: NextjsGenerationOptions): string {
  // Similar to generateFooterComponent but with React Router
  return `import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">${analysisResult.title.split(" ")[0] || "Company"}</h3>
            <p className="text-gray-300">
              We provide the best services for our customers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="text-gray-300 not-italic">
              <p>123 Street Name</p>
              <p>City, Country</p>
              <p>Email: info@example.com</p>
              <p>Phone: +1 234 567 890</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} ${analysisResult.title.split(" ")[0] || "Company"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
`
}

function generateReactSectionComponent(
  section: WebsiteElement,
  componentName: string,
  options: NextjsGenerationOptions,
): string {
  // Similar to generateSectionComponent but for React
  // Determine section type based on className or children
  let sectionType = "generic"

  if (section.className?.includes("hero")) {
    sectionType = "hero"
  } else if (section.className?.includes("feature")) {
    sectionType = "features"
  } else if (section.className?.includes("testimonial")) {
    sectionType = "testimonials"
  } else if (section.className?.includes("contact")) {
    sectionType = "contact"
  } else if (section.children?.some((child) => child.tag === "form")) {
    sectionType = "contact"
  }

  // Generate component based on section type
  const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1)

  let content = ""

  switch (sectionType) {
    case "hero":
      content = `
function ${pascalCaseName}() {
  return (
    <section className="bg-gradient-to-r from-${options.primaryColor.replace("#", "")} to-${options.secondaryColor.replace("#", "")} text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Our Website</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          We provide the best services for our customers. Discover how we can help you achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-${options.primaryColor.replace("#", "")} px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Get Started
          </button>
          <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
`
      break
    case "features":
      content = `
function ${pascalCaseName}() {
  const features = [
    {
      title: "Feature 1",
      description: "Description of feature 1. This feature provides great value to users.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Feature 2",
      description: "Description of feature 2. This feature helps users accomplish their goals.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Feature 3",
      description: "Description of feature 3. This feature enhances the user experience.",
      icon: (
        <svg className="w-12 h-12 text-${options.primaryColor.replace("#", "")}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the amazing features that make our service stand out from the competition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`
      break
    default:
      content = `
function ${pascalCaseName}() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Section Title</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a generic section that can be customized to fit your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Content Block 1</h3>
            <p className="text-gray-600">
              This is a content block that can be customized with your own content.
              Add text, images, or other elements as needed.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Content Block 2</h3>
            <p className="text-gray-600">
              This is another content block that can be customized with your own content.
              Add text, images, or other elements as needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
`
  }

  return (
    content +
    `
export default ${pascalCaseName};
`
  )
}

function generateGlobalCss(options: NextjsGenerationOptions): string {
  if (options.cssFramework === "tailwind") {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: ${options.primaryColor};
  --secondary-color: ${options.secondaryColor};
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

@layer components {
  .btn-primary {
    @apply bg-[color:var(--primary-color)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity;
  }
  
  .btn-secondary {
    @apply bg-[color:var(--secondary-color)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity;
  }
}
`
  } else {
    return `/* Base styles */
:root {
  --primary-color: ${options.primaryColor};
  --secondary-color: ${options.secondaryColor};
  --text-color: #333333;
  --background-color: #ffffff;
  --gray-100: #f7fafc;
  --gray-200: #edf2f7;
  --gray-300: #e2e8f0;
  --gray-400: #cbd5e0;
  --gray-500: #a0aec0;
  --gray-600: #718096;
  --gray-700: #4a5568;
  --gray-800: #2d3748;
  --gray-900: #1a202c;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.5;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-size: 1.5rem;
}

p {
  margin-bottom: 1rem;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  opacity: 0.9;
}

/* Layout */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

/* Responsive */
@media (min-width: 768px) {
  .md\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
`
  }
}

function generateTailwindConfig(options: NextjsGenerationOptions): string {
  const primaryColor = options.primaryColor.replace("#", "")
  const secondaryColor = options.secondaryColor.replace("#", "")

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${
      options.framework === "nextjs-app"
        ? `"./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",`
        : options.framework === "nextjs-pages"
          ? `"./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",`
          : `"./src/**/*.{js,ts,jsx,tsx}",`
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "${options.primaryColor}",
          50: "#${primaryColor}10",
          100: "#${primaryColor}20",
          200: "#${primaryColor}30",
          300: "#${primaryColor}40",
          400: "#${primaryColor}50",
          500: "#${primaryColor}60",
          600: "#${primaryColor}70",
          700: "#${primaryColor}80",
          800: "#${primaryColor}90",
          900: "#${primaryColor}",
        },
        secondary: {
          DEFAULT: "${options.secondaryColor}",
          50: "#${secondaryColor}10",
          100: "#${secondaryColor}20",
          200: "#${secondaryColor}30",
          300: "#${secondaryColor}40",
          400: "#${secondaryColor}50",
          500: "#${secondaryColor}60",
          600: "#${secondaryColor}70",
          700: "#${secondaryColor}80",
          800: "#${secondaryColor}90",
          900: "#${secondaryColor}",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
`
}

function generateContactRouteHandler(options: NextjsGenerationOptions): string {
  if (options.useTypeScript) {
    return `import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Here you would typically send an email or store the contact form data
    // For example, using a service like SendGrid, Mailgun, or storing in a database
    
    // For demonstration purposes, we'll just log the data and return a success response
    console.log('Contact form submission:', body);
    
    // Simulate a delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
`
  } else {
    return `import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Here you would typically send an email or store the contact form data
    // For example, using a service like SendGrid, Mailgun, or storing in a database
    
    // For demonstration purposes, we'll just log the data and return a success response
    console.log('Contact form submission:', body);
    
    // Simulate a delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
`
  }
}

function generateContactApiHandler(options: NextjsGenerationOptions): string {
  if (options.useTypeScript) {
    return `import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    
    // Validate the request body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Here you would typically send an email or store the contact form data
    // For example, using a service like SendGrid, Mailgun, or storing in a database
    
    // For demonstration purposes, we'll just log the data and return a success response
    console.log('Contact form submission:', { name, email, message });
    
    // Simulate a delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}
`
  } else {
    return `export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    
    // Validate the request body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Here you would typically send an email or store the contact form data
    // For example, using a service like SendGrid, Mailgun, or storing in a database
    
    // For demonstration purposes, we'll just log the data and return a success response
    console.log('Contact form submission:', { name, email, message });
    
    // Simulate a delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}
`
  }
}
