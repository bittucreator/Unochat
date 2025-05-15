export interface FigmaAuthState {
  isAuthenticated: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  userId?: string
}

export interface FigmaAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id: string
}

export interface FigmaFile {
  key: string
  name: string
  lastModified: string
  thumbnailUrl: string
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
}

export interface FigmaCreateFileResponse {
  err: null | string
  file_key: string
  name: string
}

export interface WebsiteToFigmaConversion {
  url: string
  status: "pending" | "processing" | "completed" | "failed"
  figmaFileKey?: string
  figmaFileUrl?: string
  createdAt: Date
  error?: string
}

export interface FigmaDesignElement {
  type: "text" | "rectangle" | "frame" | "component" | "image"
  properties: Record<string, any>
}

export interface WebsiteElement {
  type: string
  tag: string
  text?: string
  attributes?: Record<string, string>
  style?: Record<string, string>
  children?: WebsiteElement[]
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}
