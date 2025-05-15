# TooliQ

TooliQ is a web application that helps designers and developers convert websites to Figma designs and Next.js code.

## Features

- Convert websites to Figma designs
- Convert websites to Next.js code
- Customize generated code with various options
- Download generated code as a ZIP file

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- A Figma developer account (for Figma API integration)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/tooliq.git
   cd tooliq
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   # Figma API Configuration
   FIGMA_CLIENT_ID=your_figma_client_id
   FIGMA_CLIENT_SECRET=your_figma_client_secret
   FIGMA_REDIRECT_URI=http://localhost:3000/api/figma/callback

   # Website Analysis API (for future implementation)
   WEBSITE_ANALYSIS_API_KEY=your_analysis_api_key

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=TooliQ
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Required Variables

- `FIGMA_CLIENT_ID`: Your Figma OAuth client ID
- `FIGMA_CLIENT_SECRET`: Your Figma OAuth client secret
- `FIGMA_REDIRECT_URI`: The redirect URI for Figma OAuth (e.g., http://localhost:3000/api/figma/callback)

### Optional Variables

- `WEBSITE_ANALYSIS_API_KEY`: API key for website analysis (for future implementation)
- `NEXT_PUBLIC_APP_URL`: The URL of your application
- `NEXT_PUBLIC_APP_NAME`: The name of your application

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Import your repository to Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy your application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
