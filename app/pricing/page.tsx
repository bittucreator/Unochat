import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      description: "For individuals just getting started",
      price: "$0",
      period: "forever",
      features: [
        "5 website conversions per month",
        "Basic customization options",
        "Export to Figma or Next.js",
        "Community support",
      ],
      cta: "Get Started",
      ctaLink: "/login",
      highlight: false,
    },
    {
      name: "Pro",
      description: "For professionals and small teams",
      price: "$19",
      period: "per month",
      features: [
        "50 website conversions per month",
        "Advanced customization options",
        "Priority export queue",
        "Email support",
        "API access",
      ],
      cta: "Upgrade to Pro",
      ctaLink: "/login?plan=pro",
      highlight: true,
    },
    {
      name: "Business",
      description: "For teams and businesses",
      price: "$49",
      period: "per month",
      features: [
        "Unlimited website conversions",
        "Full customization options",
        "Instant exports",
        "Priority support",
        "Advanced API access",
        "Team collaboration",
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
      highlight: false,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start converting websites today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`amie-card p-8 flex flex-col ${
              plan.highlight ? "border-primary ring-2 ring-primary/20 relative" : ""
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-2">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant={plan.highlight ? "default" : "outline"} className="amie-button w-full">
              <Link href={plan.ctaLink}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto mt-8 grid gap-6">
          <div className="amie-card p-6">
            <h3 className="text-lg font-bold mb-2">Can I switch plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will take effect at the end of
              your current billing cycle.
            </p>
          </div>

          <div className="amie-card p-6">
            <h3 className="text-lg font-bold mb-2">What happens if I exceed my monthly conversions?</h3>
            <p className="text-muted-foreground">
              If you reach your monthly limit, you can upgrade to a higher plan or wait until your next billing cycle
              for your conversions to reset.
            </p>
          </div>

          <div className="amie-card p-6">
            <h3 className="text-lg font-bold mb-2">Do you offer a free trial?</h3>
            <p className="text-muted-foreground">
              Our Free plan allows you to try out the core features of TooliQ. You can upgrade to a paid plan anytime to
              access more features and higher conversion limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
