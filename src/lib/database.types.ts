export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          description: string
          quantity: number
          unit: string
          price: number
          supplier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          quantity?: number
          unit?: string
          price?: number
          supplier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          quantity?: number
          unit?: string
          price?: number
          supplier?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          category: 'sencillo' | 'doble-vista' | 'completo-ajustable'
          description: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'sencillo' | 'doble-vista' | 'completo-ajustable'
          description?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'sencillo' | 'doble-vista' | 'completo-ajustable'
          description?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      users_items: {
        Row: {
          id: string
          user_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          created_at?: string
        }
      }
      items_materials: {
        Row: {
          id: string
          item_id: string
          material_id: string
          quantity_used: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          material_id: string
          quantity_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          material_id?: string
          quantity_used?: number
          created_at?: string
        }
      }
    }
  }
}