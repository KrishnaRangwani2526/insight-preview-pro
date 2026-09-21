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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      esetu_artisans: {
        Row: {
          about: string
          city: string
          craft: string
          created_at: string
          id: string
          languages: string[]
          name: string
          on_time: number
          orders_done: number
          phone: string | null
          photo: string | null
          rating: number
          repeat_buyers: number
          since_year: number | null
          source: string
          updated_at: string
          verified: string[]
        }
        Insert: {
          about?: string
          city?: string
          craft?: string
          created_at?: string
          id: string
          languages?: string[]
          name: string
          on_time?: number
          orders_done?: number
          phone?: string | null
          photo?: string | null
          rating?: number
          repeat_buyers?: number
          since_year?: number | null
          source?: string
          updated_at?: string
          verified?: string[]
        }
        Update: {
          about?: string
          city?: string
          craft?: string
          created_at?: string
          id?: string
          languages?: string[]
          name?: string
          on_time?: number
          orders_done?: number
          phone?: string | null
          photo?: string | null
          rating?: number
          repeat_buyers?: number
          since_year?: number | null
          source?: string
          updated_at?: string
          verified?: string[]
        }
        Relationships: []
      }
      esetu_order_events: {
        Row: {
          at: string
          id: string
          note: string | null
          order_id: string
          stage: string
        }
        Insert: {
          at?: string
          id?: string
          note?: string | null
          order_id: string
          stage: string
        }
        Update: {
          at?: string
          id?: string
          note?: string | null
          order_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "esetu_order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "esetu_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      esetu_orders: {
        Row: {
          artisan_id: string | null
          buyer_name: string
          buyer_phone: string
          chosen_artisan_id: string | null
          city: string
          courier: string | null
          created_at: string
          expected_days: number
          id: string
          image: string | null
          kind: string
          product_id: string | null
          product_title: string
          quantity: number
          requirement: Json | null
          stage: string
          total: number
          tracking_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          artisan_id?: string | null
          buyer_name?: string
          buyer_phone?: string
          chosen_artisan_id?: string | null
          city?: string
          courier?: string | null
          created_at?: string
          expected_days?: number
          id: string
          image?: string | null
          kind?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          requirement?: Json | null
          stage?: string
          total?: number
          tracking_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          artisan_id?: string | null
          buyer_name?: string
          buyer_phone?: string
          chosen_artisan_id?: string | null
          city?: string
          courier?: string | null
          created_at?: string
          expected_days?: number
          id?: string
          image?: string | null
          kind?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          requirement?: Json | null
          stage?: string
          total?: number
          tracking_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      esetu_products: {
        Row: {
          artisan_id: string
          bulk_price: number
          city: string
          craft: string
          created_at: string
          description: string
          id: string
          images: string[]
          likes: number
          make_days: number
          materials: string
          moq: number
          price: number
          size: string
          stock: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          artisan_id: string
          bulk_price?: number
          city?: string
          craft?: string
          created_at?: string
          description?: string
          id: string
          images?: string[]
          likes?: number
          make_days?: number
          materials?: string
          moq?: number
          price?: number
          size?: string
          stock?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          bulk_price?: number
          city?: string
          craft?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          likes?: number
          make_days?: number
          materials?: string
          moq?: number
          price?: number
          size?: string
          stock?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esetu_products_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "esetu_artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      esetu_responses: {
        Row: {
          accepted_at: string
          artisan_id: string
          days: number
          id: string
          order_id: string
          quote: number
        }
        Insert: {
          accepted_at?: string
          artisan_id: string
          days?: number
          id?: string
          order_id: string
          quote?: number
        }
        Update: {
          accepted_at?: string
          artisan_id?: string
          days?: number
          id?: string
          order_id?: string
          quote?: number
        }
        Relationships: [
          {
            foreignKeyName: "esetu_responses_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "esetu_artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esetu_responses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "esetu_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      esetu_reviews: {
        Row: {
          artisan_id: string
          body: string
          buyer_name: string
          created_at: string
          id: string
          place: string
          product_id: string | null
          rating: number
        }
        Insert: {
          artisan_id: string
          body?: string
          buyer_name?: string
          created_at?: string
          id?: string
          place?: string
          product_id?: string | null
          rating?: number
        }
        Update: {
          artisan_id?: string
          body?: string
          buyer_name?: string
          created_at?: string
          id?: string
          place?: string
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "esetu_reviews_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "esetu_artisans"
            referencedColumns: ["id"]
          },
        ]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
