"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BillingPlanSelectorProps {
  currentPlan: string
}

export function BillingPlanSelector({ currentPlan }: BillingPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { toast } = useToast()

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "For individuals just getting started",
      price: { monthly: 0, yearly: 0 },
      features: [
        "5 website conversions per month",
        "Basic customization options",
        "Export to Figma or Next.js",
        "Community support",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "For professionals and small teams",
      price: { monthly: 19, yearly: 190 },
      features: [
        "50 website conversions per month",
        "Advanced customization options",
        "Priority export queue",
        "Email support",
        "API access",
      ],
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      description: "For teams and businesses",
      price: { monthly: 49, yearly: 490 },
      features: [
        "Unlimited website conversions",
        "Full customization options",
        "Instant exports",
        "Priority support",
        "Advanced API access",
        "Team collaboration",
      ],
    },
  ]

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: "Current plan",
        description: "You are already on this plan.",
      })
      return
    }

    // In a real app, you would redirect to a checkout page
    toast({
      title: "Plan upgrade",
      description: `You selected the ${planId} plan. Redirecting to checkout...`,
    })
  }

  return (
    <div className="space-y-8">
      <div className="amie-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Plan</h2>
            <p className="text-muted-foreground">
              {currentPlan === "free"
                ? "You're currently on the Free plan"
                : `You're currently on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan`}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center p-1 border rounded-full">
            <button
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                billingCycle === "monthly" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                billingCycle === "yearly" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <span className="ml-1 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-xl p-6 relative transition-all ${
                plan.id === selectedPlan ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
              } ${plan.popular ? "shadow-md" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">${plan.price[billingCycle]}</span>
                {plan.price[billingCycle] > 0 && (
                  <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                variant={plan.id === currentPlan ? "outline" : "default"}
                className="w-full amie-button"
                disabled={plan.id === currentPlan}
              >
                {plan.id === currentPlan ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="amie-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Need a custom plan?</h3>
            <p className="text-muted-foreground">Contact us for enterprise pricing and custom features.</p>
          </div>
          <Button variant="outline" className="ml-auto amie-button">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}
