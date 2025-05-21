import { cn } from "@/lib/utils"

interface UnochatLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  darkMode?: boolean
}

export function UnochatLogo({ className, size = "md", darkMode = false }: UnochatLogoProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-16 h-16",
  }

  return (
    <div className={cn(sizeClasses[size], "relative", className)}>
      <svg
        viewBox="0 0 331 330"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", darkMode ? "text-white" : "text-black")}
      >
        <mask
          id="mask0_59_7"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="331"
          height="330"
        >
          <path d="M0 0H331V330H0V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_59_7)">
          <path
            d="M330.849 165.073V163.948C330.401 118.813 293.505 82.4636 248.177 82.6146C247.802 82.6146 247.422 82.6146 247.047 82.6146H248.177V81.4844C247.724 36.2761 210.755 0.00523965 165.5 0.151073C120.25 0.00523965 83.2813 36.349 82.8282 81.4844V82.6146C37.5001 82.4636 0.604227 118.813 0.151103 163.948V165.073C6.1246e-05 210.208 36.4428 247.083 81.698 247.531H82.8282C82.6771 292.745 119.12 329.542 164.375 329.995H165.5H166.63C211.885 329.542 248.328 292.745 248.177 247.531H249.307C294.635 247.083 331 210.208 330.849 165.073ZM82.8282 247.531H83.9584C83.5782 247.531 83.2032 247.531 82.8282 247.531ZM215.271 214.714H115.729V115.432H215.349V214.714H215.271Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  )
}
