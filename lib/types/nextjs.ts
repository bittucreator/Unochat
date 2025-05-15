export interface WebsiteToNextjsConversion {
  url: string
  status: "pending" | "processing" | "completed" | "failed"
  generatedFiles?: GeneratedFile[]
  createdAt: Date
  error?: string
  options?: NextjsGenerationOptions
}

export interface GeneratedFile {
  path: string
  content: string
  type: "jsx" | "tsx" | "css" | "json" | "md" | "js" | "ts"
}

export interface NextjsGenerationOptions {
  // Framework options
  framework: "nextjs-app" | "nextjs-pages" | "react"
  cssFramework: "tailwind" | "css-modules" | "styled-components"
  useTypeScript: boolean
  useEsLint: boolean
  components: "shadcn" | "mantine" | "mui" | "chakra" | "none"

  // Styling options
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: "inter" | "roboto" | "open-sans" | "poppins" | "system"
  borderRadius: "none" | "small" | "medium" | "large" | "full"

  // Layout options
  layout: "landing" | "dashboard" | "blog" | "ecommerce" | "portfolio" | "docs"
  navigationStyle: "horizontal" | "vertical" | "both" | "minimal"
  footerStyle: "simple" | "detailed" | "minimal" | "none"

  // Feature options
  useImageOptimization: boolean
  useServerComponents: boolean
  useRouteHandlers: boolean
  useDarkMode: boolean
  useAnimations: boolean
  useInternationalization: boolean
  useAuthentication: boolean
  useSEO: boolean

  // Advanced options
  performanceOptimization: "none" | "basic" | "advanced"
  accessibilityLevel: "none" | "basic" | "wcag-aa" | "wcag-aaa"
}

export interface WebsiteElement {
  type: string
  tag: string
  text?: string
  attributes?: Record<string, string>
  style?: Record<string, string>
  children?: WebsiteElement[]
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  id?: string
  className?: string
}

export interface WebsiteAnalysisResult {
  url: string
  title: string
  description: string
  elements: WebsiteElement[]
  meta: {
    colors: string[]
    fonts: string[]
    images: string[]
    scripts: string[]
    links: string[]
  }
  structure: {
    header?: WebsiteElement
    footer?: WebsiteElement
    main?: WebsiteElement
    navigation?: WebsiteElement
    sections: WebsiteElement[]
  }
}
