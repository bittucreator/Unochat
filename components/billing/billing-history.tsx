"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function BillingHistory() {
  // In a real app, you would fetch this data from your API
  const invoices = [
    {
      id: "INV-001",
      date: "May 1, 2023",
      amount: "$0.00",
      status: "Paid",
    },
    {
      id: "INV-002",
      date: "Apr 1, 2023",
      amount: "$0.00",
      status: "Paid",
    },
    {
      id: "INV-003",
      date: "Mar 1, 2023",
      amount: "$0.00",
      status: "Paid",
    },
  ]

  return (
    <div className="amie-card p-6">
      <h3 className="text-lg font-bold mb-4">Billing History</h3>

      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-4">{invoice.amount}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No billing history available.</p>
      )}
    </div>
  )
}
