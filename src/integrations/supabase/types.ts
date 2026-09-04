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
      access_credentials: {
        Row: {
          booking_id: string | null
          created_at: string
          credential_value: string | null
          id: string
          method: string
          provider: string
          status: string
          user_id: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          credential_value?: string | null
          id?: string
          method?: string
          provider?: string
          status?: string
          user_id?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          credential_value?: string | null
          id?: string
          method?: string
          provider?: string
          status?: string
          user_id?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_credentials_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          active: boolean
          allowed_space_types: Database["public"]["Enums"]["space_type"][]
          created_at: string
          description: string | null
          id: string
          location_id: string | null
          name: string
          price_cents: number
          price_type: Database["public"]["Enums"]["addon_price_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_space_types?: Database["public"]["Enums"]["space_type"][]
          created_at?: string
          description?: string | null
          id?: string
          location_id?: string | null
          name: string
          price_cents?: number
          price_type?: Database["public"]["Enums"]["addon_price_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_space_types?: Database["public"]["Enums"]["space_type"][]
          created_at?: string
          description?: string | null
          id?: string
          location_id?: string | null
          name?: string
          price_cents?: number
          price_type?: Database["public"]["Enums"]["addon_price_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addons_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          active: boolean
          closes_at: string
          created_at: string
          id: string
          location_id: string | null
          opens_at: string
          space_id: string | null
          weekday: number | null
        }
        Insert: {
          active?: boolean
          closes_at?: string
          created_at?: string
          id?: string
          location_id?: string | null
          opens_at?: string
          space_id?: string | null
          weekday?: number | null
        }
        Update: {
          active?: boolean
          closes_at?: string
          created_at?: string
          id?: string
          location_id?: string | null
          opens_at?: string
          space_id?: string | null
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          reason: string | null
          space_id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          reason?: string | null
          space_id: string
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          reason?: string | null
          space_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_addons: {
        Row: {
          addon_id: string
          booking_id: string
          created_at: string
          id: string
          quantity: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          addon_id: string
          booking_id: string
          created_at?: string
          id?: string
          quantity?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Update: {
          addon_id?: string
          booking_id?: string
          created_at?: string
          id?: string
          quantity?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_splits: {
        Row: {
          amount_cents: number
          booking_id: string
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number
          booking_id: string
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_splits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          addons_cents: number
          company_id: string | null
          created_at: string
          currency: string
          discount_cents: number
          discount_code_id: string | null
          ends_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          location_id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          people: number
          rate_type: Database["public"]["Enums"]["rate_type"]
          reference: string
          space_id: string
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          addons_cents?: number
          company_id?: string | null
          created_at?: string
          currency?: string
          discount_cents?: number
          discount_code_id?: string | null
          ends_at: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          location_id: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          people?: number
          rate_type?: Database["public"]["Enums"]["rate_type"]
          reference?: string
          space_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          addons_cents?: number
          company_id?: string | null
          created_at?: string
          currency?: string
          discount_cents?: number
          discount_code_id?: string | null
          ends_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          location_id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          people?: number
          rate_type?: Database["public"]["Enums"]["rate_type"]
          reference?: string
          space_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          active: boolean
          billing_address: string | null
          billing_email: string | null
          created_at: string
          credit_limit_cents: number | null
          id: string
          monthly_budget_cents: number | null
          name: string
          payment_terms: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          active?: boolean
          billing_address?: string | null
          billing_email?: string | null
          created_at?: string
          credit_limit_cents?: number | null
          id?: string
          monthly_budget_cents?: number | null
          name: string
          payment_terms?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          active?: boolean
          billing_address?: string | null
          billing_email?: string | null
          created_at?: string
          credit_limit_cents?: number | null
          id?: string
          monthly_budget_cents?: number | null
          name?: string
          payment_terms?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_email: string | null
          is_admin: boolean
          monthly_limit_cents: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_email?: string | null
          is_admin?: boolean
          monthly_limit_cents?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_email?: string | null
          is_admin?: boolean
          monthly_limit_cents?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          allowed_location_ids: string[]
          allowed_space_ids: string[]
          allowed_user_ids: string[]
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          ends_at: string | null
          id: string
          minimum_booking_cents: number | null
          starts_at: string | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
          value: number
        }
        Insert: {
          active?: boolean
          allowed_location_ids?: string[]
          allowed_space_ids?: string[]
          allowed_user_ids?: string[]
          code: string
          created_at?: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          ends_at?: string | null
          id?: string
          minimum_booking_cents?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value: number
        }
        Update: {
          active?: boolean
          allowed_location_ids?: string[]
          allowed_space_ids?: string[]
          allowed_user_ids?: string[]
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          ends_at?: string | null
          id?: string
          minimum_booking_cents?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          booking_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          due_at: string | null
          id: string
          issued_at: string
          number: string
          pdf_url: string | null
          status: string
          tax_cents: number
          user_id: string | null
        }
        Insert: {
          amount_cents?: number
          booking_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          number?: string
          pdf_url?: string | null
          status?: string
          tax_cents?: number
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          number?: string
          pdf_url?: string | null
          status?: string
          tax_cents?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          access_hours: Json
          active: boolean
          address_line1: string | null
          address_line2: string | null
          amenities: Json
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          getting_there: string | null
          hero_image_url: string | null
          id: string
          images: Json
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json
          parking_info: string | null
          postal_code: string | null
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          access_hours?: Json
          active?: boolean
          address_line1?: string | null
          address_line2?: string | null
          amenities?: Json
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          getting_there?: string | null
          hero_image_url?: string | null
          id?: string
          images?: Json
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json
          parking_info?: string | null
          postal_code?: string | null
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          access_hours?: Json
          active?: boolean
          address_line1?: string | null
          address_line2?: string | null
          amenities?: Json
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          getting_there?: string | null
          hero_image_url?: string | null
          id?: string
          images?: Json
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json
          parking_info?: string | null
          postal_code?: string | null
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_subscriptions: {
        Row: {
          company_id: string | null
          created_at: string
          credits_remaining: number
          ends_at: string | null
          id: string
          membership_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          credits_remaining?: number
          ends_at?: string | null
          id?: string
          membership_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          credits_remaining?: number
          ends_at?: string | null
          id?: string
          membership_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_subscriptions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          active: boolean
          allowed_space_types: Database["public"]["Enums"]["space_type"][]
          cancellation_rules: string | null
          created_at: string
          description: string | null
          discount_percent: number
          highlights: Json
          id: string
          included_credits: number
          included_days: number
          minimum_duration_months: number
          monthly_price_cents: number
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_space_types?: Database["public"]["Enums"]["space_type"][]
          cancellation_rules?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          highlights?: Json
          id?: string
          included_credits?: number
          included_days?: number
          minimum_duration_months?: number
          monthly_price_cents?: number
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_space_types?: Database["public"]["Enums"]["space_type"][]
          cancellation_rules?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          highlights?: Json
          id?: string
          included_credits?: number
          included_days?: number
          minimum_duration_months?: number
          monthly_price_cents?: number
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          id: string
          method: string | null
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number
          booking_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "membership_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          active: boolean
          conditions: Json
          created_at: string
          currency: string
          id: string
          location_id: string | null
          min_units: number
          price_cents: number
          priority: number
          rate_type: Database["public"]["Enums"]["rate_type"]
          space_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          conditions?: Json
          created_at?: string
          currency?: string
          id?: string
          location_id?: string | null
          min_units?: number
          price_cents: number
          priority?: number
          rate_type: Database["public"]["Enums"]["rate_type"]
          space_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          conditions?: Json
          created_at?: string
          currency?: string
          id?: string
          location_id?: string | null
          min_units?: number
          price_cents?: number
          priority?: number
          rate_type?: Database["public"]["Enums"]["rate_type"]
          space_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_fk"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      space_amenities: {
        Row: {
          amenity_id: string
          space_id: string
        }
        Insert: {
          amenity_id: string
          space_id: string
        }
        Update: {
          amenity_id?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_amenities_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          sort_order: number
          space_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          space_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          space_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_images_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          capacity: number | null
          code: string | null
          created_at: string
          description: string | null
          floor: string | null
          hero_image_url: string | null
          id: string
          location_id: string
          min_booking_minutes: number
          name: string
          room_number: string | null
          rules: string | null
          size_sqm: number | null
          slug: string
          sort_order: number
          space_type: Database["public"]["Enums"]["space_type"]
          status: Database["public"]["Enums"]["space_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          description?: string | null
          floor?: string | null
          hero_image_url?: string | null
          id?: string
          location_id: string
          min_booking_minutes?: number
          name: string
          room_number?: string | null
          rules?: string | null
          size_sqm?: number | null
          slug: string
          sort_order?: number
          space_type: Database["public"]["Enums"]["space_type"]
          status?: Database["public"]["Enums"]["space_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          description?: string | null
          floor?: string | null
          hero_image_url?: string | null
          id?: string
          location_id?: string
          min_booking_minutes?: number
          name?: string
          room_number?: string | null
          rules?: string | null
          size_sqm?: number | null
          slug?: string
          sort_order?: number
          space_type?: Database["public"]["Enums"]["space_type"]
          status?: Database["public"]["Enums"]["space_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      current_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      addon_price_type: "per_booking" | "per_hour" | "per_day" | "per_person"
      app_role:
        | "customer"
        | "company_member"
        | "company_admin"
        | "staff"
        | "admin"
        | "super_admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "completed"
        | "cancelled"
        | "no_show"
      discount_type: "percentage" | "fixed_amount"
      notification_type:
        | "booking"
        | "payment"
        | "access"
        | "membership"
        | "company"
        | "system"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
      rate_type:
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "weekend"
        | "evening"
        | "member"
        | "corporate"
      space_status: "active" | "inactive" | "maintenance"
      space_type:
        | "flex_desk"
        | "dedicated_desk"
        | "private_office"
        | "team_office"
        | "meeting_room"
        | "workshop_space"
        | "other"
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
    Enums: {
      addon_price_type: ["per_booking", "per_hour", "per_day", "per_person"],
      app_role: [
        "customer",
        "company_member",
        "company_admin",
        "staff",
        "admin",
        "super_admin",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "no_show",
      ],
      discount_type: ["percentage", "fixed_amount"],
      notification_type: [
        "booking",
        "payment",
        "access",
        "membership",
        "company",
        "system",
      ],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      rate_type: [
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "weekend",
        "evening",
        "member",
        "corporate",
      ],
      space_status: ["active", "inactive", "maintenance"],
      space_type: [
        "flex_desk",
        "dedicated_desk",
        "private_office",
        "team_office",
        "meeting_room",
        "workshop_space",
        "other",
      ],
    },
  },
} as const
