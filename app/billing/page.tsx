import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BillingPlanSelector } from "@/components/billing/billing-plan-selector"
import { BillingHistory } from "@/components/billing/billing-history"
import { BillingUsage } from "@/components/billing/billing-usage"

export default async function BillingPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // In a real app, you would fetch the user's subscription data
  const userSubscription = {
    plan: "free",
    status: "active",
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Billing & Plans</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BillingPlanSelector currentPlan={userSubscription.plan} />
        </div>

        <div className="space-y-8">
          <BillingUsage />
          <BillingHistory />
        </div>
      </div>
    </div>
  )
}
