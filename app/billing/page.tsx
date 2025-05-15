import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default async function BillingPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/billing")
  }

  // Mock data for plans
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic access to TooliQ features",
      features: [
        "5 website conversions per month",
        "Basic Figma exports",
        "Basic Next.js code generation",
        "Community support",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professionals and small teams",
      features: [
        "50 website conversions per month",
        "Advanced Figma exports",
        "Advanced Next.js code generation",
        "Priority support",
        "Custom component extraction",
        "API access",
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams and organizations",
      features: [
        "Unlimited website conversions",
        "Enterprise-grade Figma exports",
        "Enterprise-grade Next.js code generation",
        "Dedicated support",
        "Custom component extraction",
        "API access",
        "Custom integrations",
        "Team management",
      ],
      current: false,
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
      <p className="text-muted-foreground mb-8">Manage your subscription and billing information</p>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`${plan.current ? "border-primary" : ""}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Billing History</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground py-8">No billing history available for your account.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
