import { cn } from "@/lib/utils"

interface CodeBlockProps {
  children: string
  language?: string
  className?: string
}

export function CodeBlock({ children, language, className }: CodeBlockProps) {
  return (
    <div className="relative rounded-md bg-vercel-gray-100 dark:bg-vercel-gray-900 my-4">
      {language && (
        <div className="absolute top-2 right-2 text-xs text-vercel-gray-500 dark:text-vercel-gray-400 font-mono">
          {language}
        </div>
      )}
      <pre
        className={cn(
          "p-4 overflow-x-auto font-mono text-sm text-vercel-fg dark:text-white",
          "font-geist-mono",
          className,
        )}
      >
        <code>{children}</code>
      </pre>
    </div>
  )
}
