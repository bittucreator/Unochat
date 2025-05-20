"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Loader2 } from "lucide-react"
import { uploadFile } from "@/app/actions/upload"
import { toast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileUploaded: (fileData: { url: string; filename: string; contentType: string }) => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadFile(formData)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        onFileUploaded({
          url: result.url,
          filename: result.filename,
          contentType: result.contentType,
        })
        toast({
          title: "File uploaded",
          description: "Your file has been uploaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf,text/plain"
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </Button>
    </div>
  )
}
