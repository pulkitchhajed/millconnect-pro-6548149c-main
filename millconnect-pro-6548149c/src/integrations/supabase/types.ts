export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      fabric_images: {
        Row: {
          created_at: string
          fabric_id: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          fabric_id: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          fabric_id?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "fabric_images_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrics: {
        Row: {
          available: boolean
          colors: string
          composition: string | null
          created_at: string
          description: string
          finish: string | null
          gsm: number | null
          id: string
          image_url: string | null
          min_order: number
          name: string
          price_per_meter: number
          shrinkage: string | null
          type: string
          unit: string
          updated_at: string
          weave: string | null
          width: string | null
        }
        Insert: {
          available?: boolean
          colors?: string
          composition?: string | null
          created_at?: string
          description?: string
          finish?: string | null
          gsm?: number | null
          id?: string
          image_url?: string | null
          min_order?: number
          name: string
          price_per_meter?: number
          shrinkage?: string | null
          type: string
          unit?: string
          updated_at?: string
          weave?: string | null
          width?: string | null
        }
        Update: {
          available?: boolean
          colors?: string
          composition?: string | null
          created_at?: string
          description?: string
          finish?: string | null
          gsm?: number | null
          id?: string
          image_url?: string | null
          min_order?: number
          name?: string
          price_per_meter?: number
          shrinkage?: string | null
          type?: string
          unit?: string
          updated_at?: string
          weave?: string | null
          width?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          fabric_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fabric_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fabric_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notes: {
        Row: {
          admin_user_id: string | null
          created_at: string
          id: string
          note: string
          order_id: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          note: string
          order_id: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_name: string
          company_name: string
          courier_name: string | null
          created_at: string
          delivery_address: string
          dispatch_date: string | null
          email: string
          fabric_id: string
          fabric_id_ref: string | null
          fabric_name: string
          id: string
          notes: string | null
          phone: string
          price_per_meter: number
          quantity: number
          status: string
          total: number
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          buyer_name: string
          company_name: string
          courier_name?: string | null
          created_at?: string
          delivery_address: string
          dispatch_date?: string | null
          email: string
          fabric_id: string
          fabric_id_ref?: string | null
          fabric_name: string
          id?: string
          notes?: string | null
          phone: string
          price_per_meter: number
          quantity: number
          status?: string
          total: number
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          buyer_name?: string
          company_name?: string
          courier_name?: string | null
          created_at?: string
          delivery_address?: string
          dispatch_date?: string | null
          email?: string
          fabric_id?: string
          fabric_id_ref?: string | null
          fabric_name?: string
          id?: string
          notes?: string | null
          phone?: string
          price_per_meter?: number
          quantity?: number
          status?: string
          total?: number
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_fabric_id_ref_fkey"
            columns: ["fabric_id_ref"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          buyer_name: string
          company_name: string
          created_at: string
          delivery_address: string
          id: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_name?: string
          company_name?: string
          created_at?: string
          delivery_address?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_name?: string
          company_name?: string
          created_at?: string
          delivery_address?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_response: string | null
          created_at: string
          fabric_id: string
          fabric_name: string
          id: string
          message: string | null
          quantity: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          fabric_id: string
          fabric_name: string
          id?: string
          message?: string | null
          quantity: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          fabric_id?: string
          fabric_name?: string
          id?: string
          message?: string | null
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "sales_manager" | "inventory_manager" | "logistics"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sales_manager", "inventory_manager", "logistics"],
    },
  },
} as const
