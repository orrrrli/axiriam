import { supabase } from '../lib/supabase';
import { Item, RawMaterial, ItemFormData, RawMaterialFormData } from '../types';

// Materials API
export const materialsApi = {
  async getAll(): Promise<RawMaterial[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(material => ({
      ...material,
      createdAt: new Date(material.created_at),
      updatedAt: new Date(material.updated_at)
    }));
  },

  async create(materialData: RawMaterialFormData): Promise<RawMaterial> {
    const { data, error } = await supabase
      .from('materials')
      .insert({
        name: materialData.name,
        description: materialData.description,
        quantity: materialData.quantity,
        unit: materialData.unit,
        price: materialData.price,
        supplier: materialData.supplier
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, materialData: RawMaterialFormData): Promise<RawMaterial> {
    const { data, error } = await supabase
      .from('materials')
      .update({
        name: materialData.name,
        description: materialData.description,
        quantity: materialData.quantity,
        unit: materialData.unit,
        price: materialData.price,
        supplier: materialData.supplier
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Items API
export const itemsApi = {
  async getAll(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        items_materials (
          material_id,
          quantity_used
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      materials: item.items_materials.map(im => im.material_id),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  },

  async create(itemData: ItemFormData): Promise<Item> {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        name: itemData.name,
        category: itemData.category,
        description: itemData.description,
        quantity: itemData.quantity,
        price: itemData.price
      })
      .select()
      .single();

    if (itemError) throw itemError;

    // Insert material associations
    if (itemData.materials.length > 0) {
      const materialAssociations = itemData.materials.map(materialId => ({
        item_id: item.id,
        material_id: materialId,
        quantity_used: 1
      }));

      const { error: materialsError } = await supabase
        .from('items_materials')
        .insert(materialAssociations);

      if (materialsError) throw materialsError;
    }
    
    return {
      ...item,
      materials: itemData.materials,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };
  },

  async update(id: string, itemData: ItemFormData): Promise<Item> {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .update({
        name: itemData.name,
        category: itemData.category,
        description: itemData.description,
        quantity: itemData.quantity,
        price: itemData.price
      })
      .eq('id', id)
      .select()
      .single();

    if (itemError) throw itemError;

    // Delete existing material associations
    const { error: deleteError } = await supabase
      .from('items_materials')
      .delete()
      .eq('item_id', id);

    if (deleteError) throw deleteError;

    // Insert new material associations
    if (itemData.materials.length > 0) {
      const materialAssociations = itemData.materials.map(materialId => ({
        item_id: id,
        material_id: materialId,
        quantity_used: 1
      }));

      const { error: materialsError } = await supabase
        .from('items_materials')
        .insert(materialAssociations);

      if (materialsError) throw materialsError;
    }
    
    return {
      ...item,
      materials: itemData.materials,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    // Delete material associations first (cascade should handle this, but being explicit)
    await supabase
      .from('items_materials')
      .delete()
      .eq('item_id', id);

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Users API (for future use)
export const usersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(userData: { email: string; name: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};