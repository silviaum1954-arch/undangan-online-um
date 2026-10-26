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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      event_photos: {
        Row: {
          created_at: string
          event_id: string
          id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          archived_at: string | null
          auto_close: boolean
          close_timing: string
          created_at: string
          design: Json
          event_date: string
          event_time: string | null
          gift_email_notify: boolean
          gift_enabled: boolean
          gift_personal_only: boolean
          gift_transfer_form: boolean
          id: string
          maps_url: string | null
          max_pax: number
          og_description: string | null
          og_image_path: string | null
          og_title: string | null
          owner_id: string
          published_at: string | null
          qris_path: string | null
          remind_archive: boolean
          slug: string
          status: Database["public"]["Enums"]["event_status"]
          theme: string
          title: string
          total_quota: number
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          wishes_auto_publish: boolean
          wishes_char_limit: number | null
          wishes_closed: boolean
          wishes_manual_approval: boolean
          wishes_spam_filter: boolean
        }
        Insert: {
          archived_at?: string | null
          auto_close?: boolean
          close_timing?: string
          created_at?: string
          design?: Json
          event_date: string
          event_time?: string | null
          gift_email_notify?: boolean
          gift_enabled?: boolean
          gift_personal_only?: boolean
          gift_transfer_form?: boolean
          id?: string
          maps_url?: string | null
          max_pax?: number
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          owner_id?: string
          published_at?: string | null
          qris_path?: string | null
          remind_archive?: boolean
          slug: string
          status?: Database["public"]["Enums"]["event_status"]
          theme?: string
          title: string
          total_quota?: number
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wishes_auto_publish?: boolean
          wishes_char_limit?: number | null
          wishes_closed?: boolean
          wishes_manual_approval?: boolean
          wishes_spam_filter?: boolean
        }
        Update: {
          archived_at?: string | null
          auto_close?: boolean
          close_timing?: string
          created_at?: string
          design?: Json
          event_date?: string
          event_time?: string | null
          gift_email_notify?: boolean
          gift_enabled?: boolean
          gift_personal_only?: boolean
          gift_transfer_form?: boolean
          id?: string
          maps_url?: string | null
          max_pax?: number
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          owner_id?: string
          published_at?: string | null
          qris_path?: string | null
          remind_archive?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["event_status"]
          theme?: string
          title?: string
          total_quota?: number
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wishes_auto_publish?: boolean
          wishes_char_limit?: number | null
          wishes_closed?: boolean
          wishes_manual_approval?: boolean
          wishes_spam_filter?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_confirmations: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          destination: string
          event_id: string
          guest_id: string | null
          id: string
          note: string | null
          sender_name: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          destination: string
          event_id: string
          guest_id?: string | null
          id?: string
          note?: string | null
          sender_name: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          destination?: string
          event_id?: string
          guest_id?: string | null
          id?: string
          note?: string | null
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_confirmations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "payment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_confirmations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_confirmations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          adults: number | null
          attending: number | null
          category: string | null
          children: number | null
          created_at: string
          event_id: string
          id: string
          name: string
          personal_slug: string
          phone: string | null
          quota: number
          responded_at: string | null
          status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string
        }
        Insert: {
          adults?: number | null
          attending?: number | null
          category?: string | null
          children?: number | null
          created_at?: string
          event_id: string
          id?: string
          name: string
          personal_slug: string
          phone?: string | null
          quota?: number
          responded_at?: string | null
          status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
        }
        Update: {
          adults?: number | null
          attending?: number | null
          category?: string | null
          children?: number | null
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          personal_slug?: string
          phone?: string | null
          quota?: number
          responded_at?: string | null
          status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at: string
          event_id: string
          id: string
          is_active: boolean
          is_primary: boolean
          sort_order: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          sort_order?: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          sort_order?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          plan: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          plan?: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          plan?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      wishes: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string | null
          id: string
          is_spam: boolean
          liked: boolean
          message: string
          sender_name: string
          status: Database["public"]["Enums"]["wish_status"]
          tag: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id?: string | null
          id?: string
          is_spam?: boolean
          liked?: boolean
          message: string
          sender_name: string
          status?: Database["public"]["Enums"]["wish_status"]
          tag?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string | null
          id?: string
          is_spam?: boolean
          liked?: boolean
          message?: string
          sender_name?: string
          status?: Database["public"]["Enums"]["wish_status"]
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_event: {
        Args: { p_guest?: string; p_slug: string }
        Returns: Json
      }
      submit_gift: {
        Args: {
          p_amount: number
          p_destination: string
          p_guest: string
          p_note?: string
          p_sender: string
          p_slug: string
        }
        Returns: undefined
      }
      submit_rsvp: {
        Args: {
          p_adults: number
          p_children: number
          p_guest: string
          p_slug: string
          p_status: Database["public"]["Enums"]["rsvp_status"]
        }
        Returns: undefined
      }
      submit_wish: {
        Args: {
          p_guest: string
          p_message: string
          p_sender: string
          p_slug: string
        }
        Returns: Json
      }
    }
    Enums: {
      account_type: "bank" | "e_wallet"
      event_status: "draf" | "terbit" | "selesai" | "diarsipkan"
      rsvp_status: "fiks" | "ragu" | "batal" | "pending"
      wish_status: "tampil" | "disembunyikan"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_type: ["bank", "e_wallet"],
      event_status: ["draf", "terbit", "selesai", "diarsipkan"],
      rsvp_status: ["fiks", "ragu", "batal", "pending"],
      wish_status: ["tampil", "disembunyikan"],
    },
  },
} as const
