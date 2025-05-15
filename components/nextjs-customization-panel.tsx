"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronRight, Code, Palette, Layout, Zap, Settings, Eye } from "lucide-react"
import { useWebsiteToNextjsConversion } from "./website-to-nextjs-provider"
import { convertWebsiteToNextjs } from "@/app/actions/nextjs-actions"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { NextjsLivePreview } from "./nextjs-live-preview"
import type { NextjsGenerationOptions } from "@/lib/types/nextjs"

export function NextjsCustomizationPanel() {
  // Framework options
  const [framework, setFramework] = useState<NextjsGenerationOptions["framework"]>("nextjs-app")
  const [cssFramework, setCssFramework] = useState<NextjsGenerationOptions["cssFramework"]>("tailwind")
  const [useTypeScript, setUseTypeScript] = useState(true)
  const [useEsLint, setUseEsLint] = useState(true)
  const [components, setComponents] = useState<NextjsGenerationOptions["components"]>("shadcn")

  // Styling options
  const [primaryColor, setPrimaryColor] = useState("#7C3AED")
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5")
  const [accentColor, setAccentColor] = useState("#F43F5E")
  const [fontFamily, setFontFamily] = useState<NextjsGenerationOptions["fontFamily"]>("inter")
  const [borderRadius, setBorderRadius] = useState<NextjsGenerationOptions["borderRadius"]>("medium")

  // Layout options
  const [layout, setLayout] = useState<NextjsGenerationOptions["layout"]>("landing")
  const [navigationStyle, setNavigationStyle] = useState<NextjsGenerationOptions["navigationStyle"]>("horizontal")
  const [footerStyle, setFooterStyle] = useState<NextjsGenerationOptions["footerStyle"]>("simple")

  // Feature options
  const [useImageOptimization, setUseImageOptimization] = useState(true)
  const [useServerComponents, setUseServerComponents] = useState(true)
  const [useRouteHandlers, setUseRouteHandlers] = useState(true)
  const [useDarkMode, setUseDarkMode] = useState(true)
  const [useAnimations, setUseAnimations] = useState(true)
  const [useInternationalization, setUseInternationalization] = useState(false)
  const [useAuthentication, setUseAuthentication] = useState(false)
  const [useSEO, setUseSEO] = useState(true)

  // Advanced options
  const [performanceOptimization, setPerformanceOptimization] =
    useState<NextjsGenerationOptions["performanceOptimization"]>("basic")
  const [accessibilityLevel, setAccessibilityLevel] = useState<NextjsGenerationOptions["accessibilityLevel"]>("wcag-aa")

  const { conversion, setConversion, isConverting } = useWebsiteToNextjsConversion()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("framework")
  const [mainView, setMainView] = useState<"options" | "preview">("options")

  // Current options for preview
  const currentOptions: NextjsGenerationOptions = {
    framework,
    cssFramework,
    useTypeScript,
    useEsLint,
    components,
    primaryColor,
    secondaryColor,
    accentColor,
    fontFamily,
    borderRadius,
    layout,
    navigationStyle,
    footerStyle,
    useImageOptimization,
    useServerComponents,
    useRouteHandlers,
    useDarkMode,
    useAnimations,
    useInternationalization,
    useAuthentication,
    useSEO,
    performanceOptimization,
    accessibilityLevel,
  }

  // Update options when conversion changes
  useEffect(() => {
    if (conversion?.options) {
      // Framework options
      setFramework(conversion.options.framework)
      setCssFramework(conversion.options.cssFramework)
      setUseTypeScript(conversion.options.useTypeScript)
      setUseEsLint(conversion.options.useEsLint)
      setComponents(conversion.options.components)

      // Styling options
      setPrimaryColor(conversion.options.primaryColor)
      setSecondaryColor(conversion.options.secondaryColor)
      if (conversion.options.accentColor) setAccentColor(conversion.options.accentColor)
      if (conversion.options.fontFamily) setFontFamily(conversion.options.fontFamily)
      if (conversion.options.borderRadius) setBorderRadius(conversion.options.borderRadius)

      // Layout options
      if (conversion.options.layout) setLayout(conversion.options.layout)
      if (conversion.options.navigationStyle) setNavigationStyle(conversion.options.navigationStyle)
      if (conversion.options.footerStyle) setFooterStyle(conversion.options.footerStyle)

      // Feature options
      setUseImageOptimization(conversion.options.useImageOptimization)
      setUseServerComponents(conversion.options.useServerComponents)
      setUseRouteHandlers(conversion.options.useRouteHandlers)
      if (conversion.options.useDarkMode !== undefined) setUseDarkMode(conversion.options.useDarkMode)
      if (conversion.options.useAnimations !== undefined) setUseAnimations(conversion.options.useAnimations)
      if (conversion.options.useInternationalization !== undefined)
        setUseInternationalization(conversion.options.useInternationalization)
      if (conversion.options.useAuthentication !== undefined) setUseAuthentication(conversion.options.useAuthentication)
      if (conversion.options.useSEO !== undefined) setUseSEO(conversion.options.useSEO)

      // Advanced options
      if (conversion.options.performanceOptimization)
        setPerformanceOptimization(conversion.options.performanceOptimization)
      if (conversion.options.accessibilityLevel) setAccessibilityLevel(conversion.options.accessibilityLevel)
    }
  }, [conversion])

  // Apply customization options
  const applyChanges = async () => {
    if (!conversion) {
      toast({
        variant: "destructive",
        title: "No conversion in progress",
        description: "Please convert a website first before applying changes.",
      })
      return
    }

    try {
      const updatedConversion = await convertWebsiteToNextjs(conversion.url, currentOptions)
      setConversion(updatedConversion)

      toast({
        title: "Changes applied",
        description: "Your customization options have been applied to the generated code.",
      })
    } catch (error) {
      console.error("Error applying changes:", error)
      toast({
        variant: "destructive",
        title: "Error applying changes",
        description: (error as Error).message || "An error occurred while applying changes.",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Customize Code Output</CardTitle>
          <CardDescription>Adjust settings for your Next.js code</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mainView === "options" ? "default" : "outline"}
            size="sm"
            onClick={() => setMainView("options")}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Options</span>
          </Button>
          <Button
            variant={mainView === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setMainView("preview")}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mainView === "options" ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="framework" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Framework</span>
                </TabsTrigger>
                <TabsTrigger value="styling" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Styling</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-1">
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Layout</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="framework" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Select
                      value={framework}
                      onValueChange={(value: NextjsGenerationOptions["framework"]) => setFramework(value)}
                    >
                      <SelectTrigger id="framework">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nextjs-app">Next.js (App Router)</SelectItem>
                        <SelectItem value="nextjs-pages">Next.js (Pages Router)</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="css-framework">CSS Framework</Label>
                    <Select
                      value={cssFramework}
                      onValueChange={(value: NextjsGenerationOptions["cssFramework"]) => setCssFramework(value)}
                    >
                      <SelectTrigger id="css-framework">
                        <SelectValue placeholder="Select CSS framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                        <SelectItem value="css-modules">CSS Modules</SelectItem>
                        <SelectItem value="styled-components">Styled Components</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="components">UI Components</Label>
                    <Select
                      value={components}
                      onValueChange={(value: NextjsGenerationOptions["components"]) => setComponents(value)}
                    >
                      <SelectTrigger id="components">
                        <SelectValue placeholder="Select components" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shadcn">shadcn/ui</SelectItem>
                        <SelectItem value="mantine">Mantine</SelectItem>
                        <SelectItem value="mui">Material UI</SelectItem>
                        <SelectItem value="chakra">Chakra UI</SelectItem>
                        <SelectItem value="none">None (custom)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-typescript">Use TypeScript</Label>
                    <Switch id="use-typescript" checked={useTypeScript} onCheckedChange={setUseTypeScript} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-eslint">Use ESLint</Label>
                    <Switch id="use-eslint" checked={useEsLint} onCheckedChange={setUseEsLint} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="styling" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: primaryColor }} />
                        <Input
                          id="primary-color"
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: secondaryColor }} />
                        <Input
                          id="secondary-color"
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: accentColor }} />
                        <Input
                          id="accent-color"
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={fontFamily}
                      onValueChange={(value: NextjsGenerationOptions["fontFamily"]) => setFontFamily(value)}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="open-sans">Open Sans</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="system">System UI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <RadioGroup
                      value={borderRadius}
                      onValueChange={(value: NextjsGenerationOptions["borderRadius"]) => setBorderRadius(value)}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="none" id="radius-none" />
                        <Label htmlFor="radius-none" className="cursor-pointer">
                          None
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="small" id="radius-small" />
                        <Label htmlFor="radius-small" className="cursor-pointer">
                          Small
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="medium" id="radius-medium" />
                        <Label htmlFor="radius-medium" className="cursor-pointer">
                          Medium
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="large" id="radius-large" />
                        <Label htmlFor="radius-large" className="cursor-pointer">
                          Large
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="full" id="radius-full" />
                        <Label htmlFor="radius-full" className="cursor-pointer">
                          Full
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="layout">Layout Type</Label>
                    <Select
                      value={layout}
                      onValueChange={(value: NextjsGenerationOptions["layout"]) => setLayout(value)}
                    >
                      <SelectTrigger id="layout">
                        <SelectValue placeholder="Select layout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landing">Landing Page</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="docs">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="navigation-style">Navigation Style</Label>
                    <Select
                      value={navigationStyle}
                      onValueChange={(value: NextjsGenerationOptions["navigationStyle"]) => setNavigationStyle(value)}
                    >
                      <SelectTrigger id="navigation-style">
                        <SelectValue placeholder="Select navigation style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">Horizontal (Top)</SelectItem>
                        <SelectItem value="vertical">Vertical (Sidebar)</SelectItem>
                        <SelectItem value="both">Both (Top + Sidebar)</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-style">Footer Style</Label>
                    <Select
                      value={footerStyle}
                      onValueChange={(value: NextjsGenerationOptions["footerStyle"]) => setFooterStyle(value)}
                    >
                      <SelectTrigger id="footer-style">
                        <SelectValue placeholder="Select footer style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="detailed">Detailed (Multi-column)</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-dark-mode" className="block">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">Add dark mode support with theme toggle</p>
                    </div>
                    <Switch id="use-dark-mode" checked={useDarkMode} onCheckedChange={setUseDarkMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-animations" className="block">
                        Animations
                      </Label>
                      <p className="text-sm text-muted-foreground">Add subtle animations and transitions</p>
                    </div>
                    <Switch id="use-animations" checked={useAnimations} onCheckedChange={setUseAnimations} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-image-optimization" className="block">
                        Image Optimization
                      </Label>
                      <p className="text-sm text-muted-foreground">Use Next.js Image component for optimization</p>
                    </div>
                    <Switch
                      id="use-image-optimization"
                      checked={useImageOptimization}
                      onCheckedChange={setUseImageOptimization}
                      disabled={framework === "react"}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-server-components" className="block">
                        Server Components
                      </Label>
                      <p className="text-sm text-muted-foreground">Use React Server Components where appropriate</p>
                    </div>
                    <Switch
                      id="use-server-components"
                      checked={useServerComponents}
                      onCheckedChange={setUseServerComponents}
                      disabled={framework !== "nextjs-app"}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-route-handlers" className="block">
                        API Routes
                      </Label>
                      <p className="text-sm text-muted-foreground">Generate API routes/handlers for forms and data</p>
                    </div>
                    <Switch
                      id="use-route-handlers"
                      checked={useRouteHandlers}
                      onCheckedChange={setUseRouteHandlers}
                      disabled={framework === "react"}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-internationalization" className="block">
                        Internationalization
                      </Label>
                      <p className="text-sm text-muted-foreground">Add multi-language support</p>
                    </div>
                    <Switch
                      id="use-internationalization"
                      checked={useInternationalization}
                      onCheckedChange={setUseInternationalization}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-authentication" className="block">
                        Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">Add user authentication (login/signup)</p>
                    </div>
                    <Switch
                      id="use-authentication"
                      checked={useAuthentication}
                      onCheckedChange={setUseAuthentication}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-seo" className="block">
                        SEO Optimization
                      </Label>
                      <p className="text-sm text-muted-foreground">Add meta tags and SEO best practices</p>
                    </div>
                    <Switch id="use-seo" checked={useSEO} onCheckedChange={setUseSEO} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="performance-optimization">Performance Optimization</Label>
                    <Select
                      value={performanceOptimization}
                      onValueChange={(value: NextjsGenerationOptions["performanceOptimization"]) =>
                        setPerformanceOptimization(value)
                      }
                    >
                      <SelectTrigger id="performance-optimization">
                        <SelectValue placeholder="Select optimization level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {performanceOptimization === "none" && "No specific performance optimizations."}
                      {performanceOptimization === "basic" &&
                        "Includes code splitting, lazy loading, and basic caching."}
                      {performanceOptimization === "advanced" &&
                        "Includes all basic optimizations plus prefetching, preloading, and advanced caching strategies."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessibility-level">Accessibility Level</Label>
                    <Select
                      value={accessibilityLevel}
                      onValueChange={(value: NextjsGenerationOptions["accessibilityLevel"]) =>
                        setAccessibilityLevel(value)
                      }
                    >
                      <SelectTrigger id="accessibility-level">
                        <SelectValue placeholder="Select accessibility level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="wcag-aa">WCAG AA</SelectItem>
                        <SelectItem value="wcag-aaa">WCAG AAA</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {accessibilityLevel === "none" && "No specific accessibility features."}
                      {accessibilityLevel === "basic" && "Includes semantic HTML and basic ARIA attributes."}
                      {accessibilityLevel === "wcag-aa" &&
                        "Follows WCAG 2.1 AA guidelines with proper contrast, focus states, and screen reader support."}
                      {accessibilityLevel === "wcag-aaa" &&
                        "Follows WCAG 2.1 AAA guidelines with the highest level of accessibility support."}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <Button className="w-full gap-2" onClick={applyChanges} disabled={isConverting || !conversion}>
                {isConverting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Apply Changes
                  </>
                )}
              </Button>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeTab === "framework") setActiveTab("advanced")
                    else if (activeTab === "styling") setActiveTab("framework")
                    else if (activeTab === "layout") setActiveTab("styling")
                    else if (activeTab === "features") setActiveTab("layout")
                    else if (activeTab === "advanced") setActiveTab("features")
                  }}
                >
                  {activeTab === "framework" ? "Last" : "Previous"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    if (activeTab === "framework") setActiveTab("styling")
                    else if (activeTab === "styling") setActiveTab("layout")
                    else if (activeTab === "layout") setActiveTab("features")
                    else if (activeTab === "features") setActiveTab("advanced")
                    else if (activeTab === "advanced") setActiveTab("framework")
                  }}
                >
                  {activeTab === "advanced" ? "First" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <NextjsLivePreview options={currentOptions} />
        )}
      </CardContent>
    </Card>
  )
}
