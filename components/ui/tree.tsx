"use client"

import type React from "react"

import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface TreeItem {
  id: string
  name: string
  icon?: React.ReactNode
  children?: TreeItem[] | Record<string, TreeItem>
}

interface TreeProps {
  items: TreeItem[]
  onSelectItem?: (item: TreeItem) => void
  level?: number
}

export function Tree({ items, onSelectItem, level = 0 }: TreeProps) {
  return (
    <ul className={cn("space-y-1", level > 0 && "pl-6")}>
      {items.map((item) => (
        <TreeNode key={item.id} item={item} onSelectItem={onSelectItem} level={level} />
      ))}
    </ul>
  )
}

interface TreeNodeProps {
  item: TreeItem
  onSelectItem?: (item: TreeItem) => void
  level: number
}

function TreeNode({ item, onSelectItem, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const hasChildren =
    item.children && (Array.isArray(item.children) ? item.children.length > 0 : Object.keys(item.children).length > 0)

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    } else if (onSelectItem) {
      onSelectItem(item)
    }
  }

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelectItem) {
      onSelectItem(item)
    }
  }

  return (
    <li>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md hover:bg-muted cursor-pointer",
          !hasChildren && "hover:text-primary",
        )}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button className="mr-1 h-4 w-4 shrink-0 text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="mr-1 h-4 w-4 shrink-0" />
        )}
        {item.icon && <span className="mr-2">{item.icon}</span>}
        <span className="text-sm truncate" onClick={hasChildren ? handleItemClick : undefined}>
          {item.name}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <Tree
          items={Array.isArray(item.children) ? item.children : Object.values(item.children)}
          onSelectItem={onSelectItem}
          level={level + 1}
        />
      )}
    </li>
  )
}
