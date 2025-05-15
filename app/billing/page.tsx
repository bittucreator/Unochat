import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function BillingPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
      <p className="text-muted-foreground mb-8">Manage your subscription and billing information</p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Current Plan</h2>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Your current subscription</CardDescription>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p className="mb-4">Your free plan includes:</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />5 website to Figma conversions per month
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />3 website to Next.js generations per month
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Basic design system detection
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Remaining this month: 5 Figma conversions, 3 Next.js generations
            </div>
            <Button variant="outline">Upgrade</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For personal projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />5 website to Figma conversions
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />3 website to Next.js generations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Basic design system detection
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pro</CardTitle>
                <Badge className="bg-primary">Popular</Badge>
              </div>
              <CardDescription>For professional creators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">$19</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  50 website to Figma conversions
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  25 website to Next.js generations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Advanced design system detection
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Code customization options
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade to Pro</Button>
            </CardFooter>
          </Card>

          {/* Team Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>For teams and agencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">$49</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Unlimited website to Figma conversions
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Unlimited website to Next.js generations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Premium design system detection
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Advanced code customization
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Team collaboration tools
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Dedicated support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Upgrade to Team
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Billing History</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground py-8">No billing history available.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
