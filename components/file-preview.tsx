import Image from "next/image"
import { FileText, File, ImageIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FilePreviewProps {
  id: number
  filename: string
  contentType: string
}

export function FilePreview({ id, filename, contentType }: FilePreviewProps) {
  // Construct the file URL
  const fileUrl = `/api/files/${id}`

  // Determine the file type to render appropriate preview
  const isImage = contentType.startsWith("image/")
  const isPdf = contentType === "application/pdf"

  return (
    <div className="my-2 max-w-xs">
      {isImage ? (
        <Card className="overflow-hidden border border-vercel-gray-200 dark:border-vercel-gray-700 bg-white dark:bg-vercel-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative aspect-video w-full">
              <Image src={fileUrl || "/placeholder.svg"} alt={filename} fill className="object-cover" />
            </div>
          </a>
          <div className="p-2 text-xs truncate bg-vercel-gray-100 dark:bg-vercel-gray-800 flex items-center">
            <ImageIcon className="h-3 w-3 mr-1.5 text-primary" />
            {filename}
          </div>
        </Card>
      ) : isPdf ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-md border border-vercel-gray-200 dark:border-vercel-gray-700 bg-white dark:bg-vercel-gray-900 hover:bg-vercel-gray-100 dark:hover:bg-vercel-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FileText className="h-5 w-5 mr-2 text-primary" />
          <span className="truncate text-sm">{filename}</span>
        </a>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-md border border-vercel-gray-200 dark:border-vercel-gray-700 bg-white dark:bg-vercel-gray-900 hover:bg-vercel-gray-100 dark:hover:bg-vercel-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <File className="h-5 w-5 mr-2 text-primary" />
          <span className="truncate text-sm">{filename}</span>
        </a>
      )}
    </div>
  )
}
