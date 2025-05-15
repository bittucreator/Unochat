"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Download, LogIn, LogOut } from "lucide-react"
import type { FigmaAuthState } from "@/lib/types/figma"
import { logoutFromFigma, startFigmaAuth } from "@/app/actions/figma-actions"
import { useToast } from "@/hooks/use-toast"

// Default auth state to prevent undefined errors
const defaultAuthState: FigmaAuthState = {
  isAuthenticated: false,
}

export function FigmaCustomizationPanel({ authState = defaultAuthState }: { authState?: FigmaAuthState }) {
  const [primaryColor, setPrimaryColor] = useState("#7C3AED")
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [textColor, setTextColor] = useState("#1F2937")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [borderRadius, setBorderRadius] = useState([8])
  const [exportOptions, setExportOptions] = useState("components")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { toast } = useToast()

  const handleFigmaLogin = async () => {
    try {
      setIsAuthenticating(true)
      const { authUrl } = await startFigmaAuth()

      // Show a toast with instructions before redirecting
      toast({
        title: "Connecting to Figma",
        description: "You'll be redirected to Figma to authorize access. Please grant all requested permissions.",
        duration: 5000,
      })

      // Short delay to allow the toast to be seen
      setTimeout(() => {
        window.location.href = authUrl
      }, 1000)
    } catch (error) {
      console.error("Error starting Figma auth:", error)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: `Failed to start Figma authentication: ${(error as Error).message || "Unknown error"}. Please try again.`,
      })
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleFigmaLogout = async () => {
    try {
      await logoutFromFigma()
      toast({
        title: "Logged Out",
        description: "You have been logged out from Figma.",
      })
      // Refresh the page to update auth state
      window.location.reload()
    } catch (error) {
      console.error("Error logging out from Figma:", error)
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "Failed to log out from Figma. Please try again.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Figma Output</CardTitle>
        <CardDescription>Adjust design elements for your Figma file</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Figma Authentication Status */}
        <div className="mb-6 p-4 border rounded-md bg-muted/40">
          <h3 className="text-sm font-medium mb-2">Figma Connection Status</h3>
          {authState.isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm">Connected to Figma</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleFigmaLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect from Figma
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <p className="text-sm">Not connected to Figma</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleFigmaLogin}
                disabled={isAuthenticating}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isAuthenticating ? "Connecting..." : "Connect to Figma"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Note: You'll need to grant both read and write permissions to allow TooliQ to create Figma files.
              </p>
            </div>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="colors">
            <AccordionTrigger>Colors</AccordionTrigger>
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
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: backgroundColor }} />
                    <Input
                      id="background-color"
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: textColor }} />
                    <Input
                      id="text-color"
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="typography">
            <AccordionTrigger>Typography</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="components">
            <AccordionTrigger>Component Styling</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <span className="text-muted-foreground">{borderRadius}px</span>
                  </div>
                  <Slider
                    id="border-radius"
                    min={0}
                    max={20}
                    step={1}
                    value={borderRadius}
                    onValueChange={setBorderRadius}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export">
            <AccordionTrigger>Export Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-options">Export Type</Label>
                  <Select value={exportOptions} onValueChange={setExportOptions}>
                    <SelectTrigger id="export-options">
                      <SelectValue placeholder="Select export type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="components">Components Only</SelectItem>
                      <SelectItem value="complete">Complete Design</SelectItem>
                      <SelectItem value="layout">Layout Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 space-y-4">
          <Button className="w-full gap-2" disabled={!authState.isAuthenticated}>
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
          <Button variant="outline" className="w-full gap-2" disabled={!authState.isAuthenticated}>
            <Download className="h-4 w-4" />
            Export Figma File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
