import JSZip from "jszip"
import type { GeneratedFile } from "../types/nextjs"

/**
 * Creates a ZIP file from an array of generated files
 * @param files Array of generated files
 * @param projectName Name of the project (used for the ZIP file name)
 * @returns Blob of the ZIP file
 */
export async function createZipFromFiles(files: GeneratedFile[], projectName = "nextjs-project"): Promise<Blob> {
  const zip = new JSZip()

  // Add files to the ZIP
  files.forEach((file) => {
    // Create folders if needed
    const path = file.path
    zip.file(path, file.content)
  })

  // Add a README.md file with instructions
  const readmeContent = `# ${projectName}

This project was generated using TooliQ's Website to Next.js converter.

## Getting Started

1. Extract the contents of this ZIP file
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The project follows the standard Next.js structure:

- \`app/\` or \`pages/\` - Contains the pages of your application
- \`components/\` - Contains reusable React components
- \`public/\` - Contains static assets
- \`styles/\` - Contains CSS files

## Learn More

To learn more about Next.js, check out the [Next.js documentation](https://nextjs.org/docs).
`

  zip.file("README.md", readmeContent)

  // Add a package.json file if it doesn't exist
  const packageJsonExists = files.some((file) => file.path === "package.json")
  if (!packageJsonExists) {
    const packageJsonContent = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "^14.0.0",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        ...(files.some((file) => file.path.includes("tailwind"))
          ? {
              tailwindcss: "^3.3.0",
              autoprefixer: "^10.4.14",
              postcss: "^8.4.21",
            }
          : {}),
      },
      devDependencies: {
        ...(files.some((file) => file.path.endsWith(".ts") || file.path.endsWith(".tsx"))
          ? {
              typescript: "^5.0.4",
              "@types/node": "^18.15.11",
              "@types/react": "^18.0.37",
              "@types/react-dom": "^18.0.11",
            }
          : {}),
        ...(files.some((file) => file.path.includes("eslint"))
          ? {
              eslint: "^8.38.0",
              "eslint-config-next": "^13.3.0",
            }
          : {}),
      },
    }
    zip.file("package.json", JSON.stringify(packageJsonContent, null, 2))
  }

  // Generate the ZIP file
  return await zip.generateAsync({ type: "blob" })
}

/**
 * Triggers a download of a blob as a file
 * @param blob Blob to download
 * @param filename Name of the file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
