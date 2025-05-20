import Image from "next/image"
import { FileText, File } from "lucide-react"

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
        <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Image
              src={fileUrl || "/placeholder.svg"}
              alt={filename}
              width={300}
              height={200}
              className="object-contain max-h-[200px] w-full"
            />
          </a>
          <div className="p-2 text-xs truncate bg-gray-50 dark:bg-gray-800">{filename}</div>
        </div>
      ) : isPdf ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <FileText className="h-5 w-5 mr-2 text-purple-600" />
          <span className="truncate">{filename}</span>
        </a>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <File className="h-5 w-5 mr-2 text-purple-600" />
          <span className="truncate">{filename}</span>
        </a>
      )}
    </div>
  )
}
