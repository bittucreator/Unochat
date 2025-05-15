"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, CopyIcon, DownloadIcon, FileIcon, FolderIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { WebsiteToNextjsConversion } from "@/lib/types/nextjs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tree, type TreeItem } from "@/components/ui/tree"
import { generateZipFile } from "@/app/actions/download-actions"
import { downloadBlob } from "@/lib/utils/zip-generator"
import { useToast } from "@/hooks/use-toast"

interface NextjsPreviewProps {
  conversion?: WebsiteToNextjsConversion
  selectedFile: string | null
  onSelectFile: (file: string | null) => void
}

export function NextjsPreview({ conversion, selectedFile, onSelectFile }: NextjsPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview")
  const [fileTree, setFileTree] = useState<TreeItem[]>([])
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  // Generate file tree from conversion files
  useEffect(() => {
    if (conversion?.generatedFiles) {
      const tree = buildFileTree(conversion.generatedFiles)
      setFileTree(tree)

      // Select the first file by default if none is selected
      if (!selectedFile && conversion.generatedFiles.length > 0) {
        onSelectFile(conversion.generatedFiles[0].path)
      }
    }
  }, [conversion, selectedFile, onSelectFile])

  // Build file tree from flat file list
  const buildFileTree = (files: { path: string; content: string; type: string }[]) => {
    const tree: Record<string, TreeItem> = {}

    // Sort files to ensure directories come before files
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

    sortedFiles.forEach((file) => {
      const parts = file.path.split("/")
      let currentPath = ""
      let currentLevel = tree

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        const fullPath = currentPath ? `${currentPath}/${part}` : part
        currentPath = fullPath

        if (isFile) {
          if (!currentLevel[part]) {
            currentLevel[part] = {
              id: fullPath,
              name: part,
              icon: getFileIcon(part),
              children: [],
            }
          }
        } else {
          if (!currentLevel[part]) {
            currentLevel[part] = {
              id: fullPath,
              name: part,
              icon: <FolderIcon className="h-4 w-4 text-muted-foreground" />,
              children: {},
            }
          }
          currentLevel = currentLevel[part].children as Record<string, TreeItem>
        }
      })
    })

    // Convert the tree object to an array structure
    const convertToArray = (obj: Record<string, TreeItem>): TreeItem[] => {
      return Object.values(obj).map((item) => {
        if (item.children && typeof item.children === "object" && !Array.isArray(item.children)) {
          item.children = convertToArray(item.children as Record<string, TreeItem>)
        }
        return item
      })
    }

    return convertToArray(tree)
  }

  // Get icon based on file extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
      case "tsx":
      case "jsx":
        return <FileIcon className="h-4 w-4 text-blue-500" />
      case "css":
        return <FileIcon className="h-4 w-4 text-purple-500" />
      case "js":
      case "ts":
        return <FileIcon className="h-4 w-4 text-yellow-500" />
      case "json":
        return <FileIcon className="h-4 w-4 text-green-500" />
      default:
        return <FileIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get selected file content
  const getSelectedFileContent = () => {
    if (!conversion?.generatedFiles || !selectedFile) return null

    const file = conversion.generatedFiles.find((f) => f.path === selectedFile)
    return file?.content || null
  }

  // Copy file content to clipboard
  const copyToClipboard = async () => {
    const content = getSelectedFileContent()
    if (content) {
      try {
        await navigator.clipboard.writeText(content)
        setCopySuccess("Copied!")
        setTimeout(() => setCopySuccess(null), 2000)
      } catch (err) {
        setCopySuccess("Failed to copy")
        setTimeout(() => setCopySuccess(null), 2000)
      }
    }
  }

  // Download all files as zip
  const downloadFiles = async () => {
    if (!conversion?.generatedFiles?.length) return

    try {
      setIsDownloading(true)

      // Generate a project name from the URL
      const urlObj = new URL(conversion.url)
      const domain = urlObj.hostname.replace(/^www\./, "").replace(/\./g, "-")
      const projectName = `${domain}-nextjs-project`

      // Generate the ZIP file on the server
      const result = await generateZipFile(conversion.generatedFiles, projectName)

      if (result.success && result.base64) {
        // Convert base64 to blob
        const binaryString = atob(result.base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: "application/zip" })

        // Download the blob
        downloadBlob(blob, `${projectName}.zip`)

        toast({
          title: "Download successful",
          description: "Your Next.js project has been downloaded as a ZIP file.",
        })
      } else {
        throw new Error(result.error || "Failed to generate ZIP file")
      }
    } catch (error) {
      console.error("Error downloading files:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: (error as Error).message || "Failed to download files. Please try again.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Next.js Preview</CardTitle>
          <CardDescription>Preview the generated Next.js code</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={copyToClipboard}
            disabled={!selectedFile || !getSelectedFileContent()}
          >
            <CopyIcon className="h-4 w-4" />
            {copySuccess || "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={downloadFiles}
            disabled={!conversion?.generatedFiles?.length || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4" />
                Download ZIP
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conversion?.status === "failed" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Conversion Failed</AlertTitle>
            <AlertDescription>{conversion.error || "An error occurred during conversion"}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] flex items-center justify-center">
              {conversion?.status === "completed" ? (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Next.js Code Generated Successfully!</h2>
                    <p className="text-muted-foreground mb-4">
                      Your website has been converted to Next.js code. You can view the files in the "Files" tab and
                      explore the code in the "Code" tab.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={() => setActiveTab("files")}>View Files</Button>
                      <Button variant="outline" onClick={downloadFiles} disabled={isDownloading}>
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download ZIP
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : conversion?.status === "processing" ? (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Processing your website conversion...</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Site preview placeholder"
                    className="mx-auto rounded-md"
                  />
                  <p className="text-muted-foreground">Enter a URL and click "Convert" to generate Next.js code</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="files" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
              <div className="rounded-md border bg-muted/40 p-4 overflow-auto">
                <h3 className="text-sm font-medium mb-2">File Explorer</h3>
                {fileTree.length > 0 ? (
                  <ScrollArea className="h-[450px]">
                    <Tree items={fileTree} onSelectItem={(item) => onSelectFile(item.id as string)} />
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">No files generated yet</p>
                  </div>
                )}
              </div>
              <div className="rounded-md border bg-muted p-4 col-span-2 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">{selectedFile || "No file selected"}</h3>
                  {selectedFile && (
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <CopyIcon className="h-4 w-4 mr-1" />
                      {copySuccess || "Copy"}
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[450px] w-full">
                  {getSelectedFileContent() ? (
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{getSelectedFileContent()}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-sm">
                        {conversion?.generatedFiles?.length
                          ? "Select a file from the explorer"
                          : "No files generated yet"}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <div className="rounded-md border bg-muted p-4 h-[500px] overflow-auto">
              <ScrollArea className="h-full">
                {conversion?.status === "completed" ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">App Structure</h3>
                      <pre className="text-sm text-muted-foreground bg-muted-foreground/10 p-4 rounded-md">
                        {`${
                          conversion.options?.framework === "nextjs-app"
                            ? `app/
├── layout.tsx       # Root layout with metadata
├── page.tsx         # Home page component
├── globals.css      # Global styles
└── api/
    └── contact/
        └── route.ts # API route handler for contact form`
                            : conversion.options?.framework === "nextjs-pages"
                              ? `pages/
├── _app.tsx         # Custom App component
├── _document.tsx    # Custom Document component
├── index.tsx        # Home page component
└── api/
    └── contact.ts   # API endpoint for contact form

styles/
└── globals.css      # Global styles`
                              : `src/
├── App.tsx          # Main App component
├── index.tsx        # Entry point
└── index.css        # Global styles`
                        }

components/
├── header.tsx       # Header component
├── footer.tsx       # Footer component
${conversion.options?.framework === "nextjs-app" ? "└── [section].tsx     # Section components" : "└── [section].jsx     # Section components"}

${conversion.options?.cssFramework === "tailwind" ? "tailwind.config.js    # Tailwind configuration" : ""}`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                      <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        <li>
                          <span className="font-medium text-foreground">Framework:</span>{" "}
                          {conversion.options?.framework === "nextjs-app"
                            ? "Next.js with App Router"
                            : conversion.options?.framework === "nextjs-pages"
                              ? "Next.js with Pages Router"
                              : "React"}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">CSS Framework:</span>{" "}
                          {conversion.options?.cssFramework === "tailwind"
                            ? "Tailwind CSS"
                            : conversion.options?.cssFramework === "css-modules"
                              ? "CSS Modules"
                              : "Styled Components"}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Language:</span>{" "}
                          {conversion.options?.useTypeScript ? "TypeScript" : "JavaScript"}
                        </li>
                        <li>
                          <span className="font-medium text-foreground">Components:</span>{" "}
                          {conversion.options?.components === "shadcn" ? "shadcn/ui" : conversion.options?.components}
                        </li>
                        {conversion.options?.useServerComponents && (
                          <li>
                            <span className="font-medium text-foreground">Server Components:</span> Enabled
                          </li>
                        )}
                        {conversion.options?.useRouteHandlers && (
                          <li>
                            <span className="font-medium text-foreground">API Routes:</span> Included
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Usage Instructions</h3>
                      <div className="bg-muted-foreground/10 p-4 rounded-md space-y-4">
                        <p className="text-muted-foreground">To use this code:</p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                          <li>
                            Download the generated files using the{" "}
                            <Button
                              variant="link"
                              className="p-0 h-auto text-primary"
                              onClick={downloadFiles}
                              disabled={isDownloading}
                            >
                              {isDownloading ? "Downloading..." : "Download ZIP"}
                            </Button>{" "}
                            button
                          </li>
                          <li>Extract the contents of the ZIP file to a directory on your computer</li>
                          <li>
                            Open a terminal in that directory and install dependencies:{" "}
                            <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">npm install</code>
                          </li>
                          <li>
                            Start the development server:{" "}
                            <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">npm run dev</code>
                          </li>
                          <li>
                            Open{" "}
                            <a
                              href="http://localhost:3000"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              http://localhost:3000
                            </a>{" "}
                            in your browser
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      {conversion?.status === "processing"
                        ? "Processing your website conversion..."
                        : "Enter a URL and click 'Convert' to generate Next.js code"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="structure" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] overflow-auto">
              {conversion?.status === "completed" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Component Structure</h3>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <div className="border-b pb-2 mb-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-medium">Layout</span>
                        </div>
                        <div className="ml-6 mt-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Header</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <span>Main Content</span>
                          </div>
                          <div className="ml-5 mt-1">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Hero Section</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Features Section</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Testimonials Section</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Contact Section</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span>Footer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Page Structure</h3>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-medium">Pages</span>
                        </div>
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Home Page</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>About Page (placeholder)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Services Page (placeholder)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Contact Page (placeholder)</span>
                          </div>
                        </div>
                      </div>

                      {conversion.options?.useRouteHandlers && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                            <span className="font-medium">API Routes</span>
                          </div>
                          <div className="ml-6 mt-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                              <span>Contact Form Handler</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {conversion?.status === "processing"
                      ? "Processing your website conversion..."
                      : "Enter a URL and click 'Convert' to generate Next.js code"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
