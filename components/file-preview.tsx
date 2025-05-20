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
        <Card className="overflow-hidden border border-pastel-lavender/30 dark:border-pastel-lilac/10 bg-white/80 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all duration-200">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative aspect-video w-full">
              <Image src={fileUrl || "/placeholder.svg"} alt={filename} fill className="object-cover" />
            </div>
          </a>
          <div className="p-2 text-xs truncate bg-pastel-lavender/10 dark:bg-pastel-lilac/5 flex items-center">
            <ImageIcon className="h-3 w-3 mr-1.5 text-pastel-sky" />
            {filename}
          </div>
        </Card>
      ) : isPdf ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-xl border border-pastel-lavender/30 dark:border-pastel-lilac/10 bg-white/80 dark:bg-gray-800/60 hover:bg-pastel-lavender/10 dark:hover:bg-pastel-lilac/5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FileText className="h-5 w-5 mr-2 text-pastel-coral" />
          <span className="truncate text-sm">{filename}</span>
        </a>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-xl border border-pastel-lavender/30 dark:border-pastel-lilac/10 bg-white/80 dark:bg-gray-800/60 hover:bg-pastel-lavender/10 dark:hover:bg-pastel-lilac/5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <File className="h-5 w-5 mr-2 text-pastel-mint" />
          <span className="truncate text-sm">{filename}</span>
        </a>
      )}
    </div>
  )
}
