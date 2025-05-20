"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileUploaded: (fileData: { id: number; filename: string; contentType: string }) => void
  messageId?: number
}

export function FileUpload({ onFileUploaded, messageId }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (messageId) {
        formData.append("messageId", messageId.toString())
      }

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()

      if (result.success) {
        onFileUploaded({
          id: result.id,
          filename: result.filename,
          contentType: result.contentType,
        })
        toast({
          title: "File uploaded",
          description: "Your file has been uploaded successfully",
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
