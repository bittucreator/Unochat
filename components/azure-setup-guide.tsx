import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function AzureSetupGuide() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Azure OpenAI Setup Guide</CardTitle>
        <CardDescription>Follow these steps to set up Azure OpenAI for your Research Agent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Make sure you have access to Azure OpenAI Service and have created a resource in the Azure portal.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="font-medium">1. Create an Azure OpenAI resource</h3>
          <p className="text-sm text-muted-foreground">
            If you haven't already, create an Azure OpenAI resource in the Azure portal.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">2. Deploy a model</h3>
          <p className="text-sm text-muted-foreground">
            Deploy a model (like GPT-4) in your Azure OpenAI resource. Note the deployment name as you'll need it for
            the environment variable.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">3. Get your API credentials</h3>
          <p className="text-sm text-muted-foreground">From your Azure OpenAI resource, get the following:</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>API Key (from "Keys and Endpoint" section)</li>
            <li>
              Endpoint URL (from "Keys and Endpoint" section)
              <br />
              <span className="text-xs text-amber-600">
                Important: Use the full API endpoint URL, not just the base URL
              </span>
              <br />
              <span className="text-xs">
                Example:
                https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
              </span>
            </li>
            <li>Deployment Name (the name you gave to your model deployment)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">4. Set up environment variables</h3>
          <p className="text-sm text-muted-foreground">
            Create a .env.local file in your project root with the following variables:
          </p>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
            AZURE_OPENAI_API_KEY=your_api_key_here
            AZURE_OPENAI_API_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
            AZURE_OPENAI_API_DEPLOYMENT_NAME=your-deployment-name
          </pre>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">5. Restart your application</h3>
          <p className="text-sm text-muted-foreground">
            After setting up the environment variables, restart your application for the changes to take effect.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
