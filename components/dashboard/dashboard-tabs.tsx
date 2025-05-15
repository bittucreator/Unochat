"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversionsList } from "./conversions-list"
import type { Tables } from "@/lib/supabase/database.types"

interface DashboardTabsProps {
  conversions: Tables<"website_conversions">[]
}

export function DashboardTabs({ conversions }: DashboardTabsProps) {
  const figmaConversions = conversions.filter((conversion) => conversion.type === "figma")
  const nextjsConversions = conversions.filter((conversion) => conversion.type === "nextjs")

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="all">All Conversions</TabsTrigger>
        <TabsTrigger value="figma">Figma Designs</TabsTrigger>
        <TabsTrigger value="nextjs">Next.js Code</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <ConversionsList conversions={conversions} />
      </TabsContent>
      <TabsContent value="figma">
        <ConversionsList conversions={figmaConversions} />
      </TabsContent>
      <TabsContent value="nextjs">
        <ConversionsList conversions={nextjsConversions} />
      </TabsContent>
    </Tabs>
  )
}
