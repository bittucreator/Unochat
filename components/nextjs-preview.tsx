"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CopyIcon, DownloadIcon } from "lucide-react"

export function NextjsPreview() {
  const [activeTab, setActiveTab] = useState("preview")

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Next.js Preview</CardTitle>
          <CardDescription>Preview the generated Next.js code</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <CopyIcon className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="jsx">JSX</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <img
                  src="/placeholder.svg?height=200&width=300"
                  alt="Site preview placeholder"
                  className="mx-auto rounded-md"
                />
                <p className="text-muted-foreground">Enter a URL and click "Convert" to generate a preview</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="jsx" className="mt-4">
            <div className="rounded-md border bg-muted p-4 h-[500px] overflow-auto">
              <pre className="text-sm text-muted-foreground">
                {`// app/page.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, 
         CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">
        Welcome to TooliQ
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature 1</CardTitle>
            <CardDescription>
              Description of Feature 1
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <Button>Learn More</Button>
          </CardFooter>
        </Card>
        
        {/* Additional cards would be here */}
        
      </div>
    </div>
  )
}`}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="css" className="mt-4">
            <div className="rounded-md border bg-muted p-4 h-[500px] overflow-auto">
              <pre className="text-sm text-muted-foreground">
                {`/* tailwind.config.js */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#4F46E5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <div className="rounded-md border bg-muted p-4 h-[500px] overflow-auto">
              <pre className="text-sm text-muted-foreground">
                {`// app/api/contact/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  
  // Example validation
  if (!body.email || !body.message) {
    return NextResponse.json(
      { error: 'Email and message are required' },
      { status: 400 }
    )
  }

  // Process the contact form submission
  // This would typically involve sending an email, 
  // storing in a database, etc.
  
  return NextResponse.json(
    { success: true },
    { status: 200 }
  )
}`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
