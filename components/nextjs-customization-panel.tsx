"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useWebsiteToNextjsConversion } from "./website-to-nextjs-provider"
import { convertWebsiteToNextjs } from "@/app/actions/nextjs-actions"
import { useToast } from "@/hooks/use-toast"
import type { NextjsGenerationOptions } from "@/lib/types/nextjs"

export function NextjsCustomizationPanel() {
  const [primaryColor, setPrimaryColor] = useState("#7C3AED")
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5")
  const [framework, setFramework] = useState<NextjsGenerationOptions["framework"]>("nextjs-app")
  const [cssFramework, setCssFramework] = useState<NextjsGenerationOptions["cssFramework"]>("tailwind")
  const [useTypeScript, setUseTypeScript] = useState(true)
  const [useEsLint, setUseEsLint] = useState(true)
  const [components, setComponents] = useState<NextjsGenerationOptions["components"]>("shadcn")
  const [useImageOptimization, setUseImageOptimization] = useState(true)
  const [useServerComponents, setUseServerComponents] = useState(true)
  const [useRouteHandlers, setUseRouteHandlers] = useState(true)

  const { conversion, setConversion, isConverting } = useWebsiteToNextjsConversion()
  const { toast } = useToast()

  // Update options when conversion changes
  useEffect(() => {
    if (conversion?.options) {
      setPrimaryColor(conversion.options.primaryColor)
      setSecondaryColor(conversion.options.secondaryColor)
      setFramework(conversion.options.framework)
      setCssFramework(conversion.options.cssFramework)
      setUseTypeScript(conversion.options.useTypeScript)
      setUseEsLint(conversion.options.useEsLint)
      setComponents(conversion.options.components)
      setUseImageOptimization(conversion.options.useImageOptimization)
      setUseServerComponents(conversion.options.useServerComponents)
      setUseRouteHandlers(conversion.options.useRouteHandlers)
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

    const options: NextjsGenerationOptions = {
      framework,
      cssFramework,
      useTypeScript,
      useEsLint,
      components,
      primaryColor,
      secondaryColor,
      useImageOptimization,
      useServerComponents,
      useRouteHandlers,
    }

    try {
      const updatedConversion = await convertWebsiteToNextjs(conversion.url, options)
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
      <CardHeader>
        <CardTitle>Customize Code Output</CardTitle>
        <CardDescription>Adjust settings for your Next.js code</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="framework">
            <AccordionTrigger>Framework Options</AccordionTrigger>
            <AccordionContent>
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-typescript">Use TypeScript</Label>
                  <Switch id="use-typescript" checked={useTypeScript} onCheckedChange={setUseTypeScript} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-eslint">Use ESLint</Label>
                  <Switch id="use-eslint" checked={useEsLint} onCheckedChange={setUseEsLint} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="styling">
            <AccordionTrigger>Styling</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
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
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="optimization">
            <AccordionTrigger>Optimization</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-image-optimization">Use Next.js Image Optimization</Label>
                  <Switch
                    id="use-image-optimization"
                    checked={useImageOptimization}
                    onCheckedChange={setUseImageOptimization}
                    disabled={framework === "react"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-server-components">Use React Server Components</Label>
                  <Switch
                    id="use-server-components"
                    checked={useServerComponents}
                    onCheckedChange={setUseServerComponents}
                    disabled={framework !== "nextjs-app"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-route-handlers">Generate API Route Handlers</Label>
                  <Switch
                    id="use-route-handlers"
                    checked={useRouteHandlers}
                    onCheckedChange={setUseRouteHandlers}
                    disabled={framework === "react"}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 space-y-4">
          <Button className="w-full gap-2" onClick={applyChanges} disabled={isConverting || !conversion}>
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
