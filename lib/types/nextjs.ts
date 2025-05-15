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
  framework: "nextjs-app" | "nextjs-pages" | "react"
  cssFramework: "tailwind" | "css-modules" | "styled-components"
  useTypeScript: boolean
  useEsLint: boolean
  components: "shadcn" | "mantine" | "mui" | "chakra" | "none"
  primaryColor: string
  secondaryColor: string
  useImageOptimization: boolean
  useServerComponents: boolean
  useRouteHandlers: boolean
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
