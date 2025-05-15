"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Download, Copy } from "lucide-react"

export function NextjsCustomizationPanel() {
  const [primaryColor, setPrimaryColor] = useState("#7C3AED")
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5")
  const [framework, setFramework] = useState("nextjs-app")
  const [cssFramework, setCssFramework] = useState("tailwind")
  const [useTypeScript, setUseTypeScript] = useState(true)
  const [useEsLint, setUseEsLint] = useState(true)
  const [components, setComponents] = useState("shadcn")

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
                  <Select value={framework} onValueChange={setFramework}>
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
                  <Select value={cssFramework} onValueChange={setCssFramework}>
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
                  <Select value={components} onValueChange={setComponents}>
                    <SelectTrigger id="components">
                      <SelectValue placeholder="Select components" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shadcn">shadcn/ui</SelectItem>
                      <SelectItem value="mantine">Mantine</SelectItem>
                      <SelectItem value="mui">Material UI</SelectItem>
                      <SelectItem value="chakra">Chakra UI</SelectItem>
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
                  <Switch id="use-image-optimization" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-server-components">Use React Server Components</Label>
                  <Switch id="use-server-components" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-route-handlers">Generate API Route Handlers</Label>
                  <Switch id="use-route-handlers" defaultChecked />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 space-y-4">
          <Button className="w-full gap-2">
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download Code
          </Button>
          <Button variant="secondary" className="w-full gap-2">
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
