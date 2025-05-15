export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string
          user_id: string
          linear_api_key?: string
          azure_openai_api_key?: string
          azure_openai_endpoint?: string
          azure_openai_deployment_name?: string
          preferred_ai_provider: "openai" | "azure"
          auto_prioritize: boolean
          auto_assign: boolean
          deadline_suggestions: boolean
          description_analysis: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          linear_api_key?: string
          azure_openai_api_key?: string
          azure_openai_endpoint?: string
          azure_openai_deployment_name?: string
          preferred_ai_provider?: "openai" | "azure"
          auto_prioritize?: boolean
          auto_assign?: boolean
          deadline_suggestions?: boolean
          description_analysis?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          linear_api_key?: string
          azure_openai_api_key?: string
          azure_openai_endpoint?: string
          azure_openai_deployment_name?: string
          preferred_ai_provider?: "openai" | "azure"
          auto_prioritize?: boolean
          auto_assign?: boolean
          deadline_suggestions?: boolean
          description_analysis?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url?: string
          linear_user_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          avatar_url?: string
          linear_user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string
          linear_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
