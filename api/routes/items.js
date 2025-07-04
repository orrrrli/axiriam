import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/items - Get all items with their materials
router.get('/', async (req, res) => {
  try {
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        *,
        item_materials (
          raw_material_id,
          raw_materials (
            id,
            name,
            width,
            height,
            unit
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (itemsError) throw itemsError;

    // Transform the data to match frontend expectations
    const transformedItems = items?.map(item => ({
      ...item,
      materials: item.item_materials?.map(im => im.raw_material_id) || []
    })) || [];

    res.json({
      success: true,
      data: transformedItems,
      count: transformedItems.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items',
      message: error.message
    });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: item, error: itemError } = await supabase
      .from('items')
      .select(`
        *,
        item_materials (
          raw_material_id,
          raw_materials (
            id,
            name,
            width,
            height,
            unit
          )
        )
      `)
      .eq('id', id)
      .single();

    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      throw itemError;
    }

    // Transform the data
    const transformedItem = {
      ...item,
      materials: item.item_materials?.map(im => im.raw_material_id) || []
    };

    res.json({
      success: true,
      data: transformedItem
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item',
      message: error.message
    });
  }
});

// POST /api/items - Create new item
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      description = '',
      quantity = 0,
      price = 0,
      materials = []
    } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name and category are required'
      });
    }

    const validCategories = ['sencillo', 'doble-vista', 'completo', 'sencillo-algodon', 'completo-algodon', 'stretch'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    if (quantity < 0 || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid values',
        message: 'Quantity and price cannot be negative'
      });
    }

    // Create item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert([{
        name,
        category,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price)
      }])
      .select()
      .single();

    if (itemError) throw itemError;

    // Add material relationships
    if (materials.length > 0) {
      const materialRelations = materials.map(materialId => ({
        item_id: item.id,
        raw_material_id: materialId
      }));

      const { error: materialsError } = await supabase
        .from('item_materials')
        .insert(materialRelations);

      if (materialsError) throw materialsError;
    }

    // Fetch the complete item with materials
    const { data: completeItem } = await supabase
      .from('items')
      .select(`
        *,
        item_materials (
          raw_material_id
        )
      `)
      .eq('id', item.id)
      .single();

    const transformedItem = {
      ...completeItem,
      materials: completeItem.item_materials?.map(im => im.raw_material_id) || []
    };

    res.status(201).json({
      success: true,
      data: transformedItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create item',
      message: error.message
    });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      quantity,
      price,
      materials
    } = req.body;

    // Validation
    if (category) {
      const validCategories = ['sencillo', 'doble-vista', 'completo', 'sencillo-algodon', 'completo-algodon', 'stretch'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category',
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity cannot be negative'
      });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price',
        message: 'Price cannot be negative'
      });
    }

    // Update item
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (price !== undefined) updateData.price = parseFloat(price);

    const { data: item, error: itemError } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      throw itemError;
    }

    // Update material relationships if provided
    if (materials !== undefined) {
      // Delete existing relationships
      await supabase
        .from('item_materials')
        .delete()
        .eq('item_id', id);

      // Add new relationships
      if (materials.length > 0) {
        const materialRelations = materials.map(materialId => ({
          item_id: id,
          raw_material_id: materialId
        }));

        const { error: materialsError } = await supabase
          .from('item_materials')
          .insert(materialRelations);

        if (materialsError) throw materialsError;
      }
    }

    // Fetch the complete updated item
    const { data: completeItem } = await supabase
      .from('items')
      .select(`
        *,
        item_materials (
          raw_material_id
        )
      `)
      .eq('id', id)
      .single();

    const transformedItem = {
      ...completeItem,
      materials: completeItem.item_materials?.map(im => im.raw_material_id) || []
    };

    res.json({
      success: true,
      data: transformedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update item',
      message: error.message
    });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item is used in any sales
    const { data: saleItems, error: checkError } = await supabase
      .from('sale_items')
      .select('id')
      .eq('item_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (saleItems && saleItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete item',
        message: 'This item is used in one or more sales'
      });
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete item',
      message: error.message
    });
  }
});

// PATCH /api/items/:id/reduce-quantity - Reduce item quantity (for gifts)
router.patch('/:id/reduce-quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity must be greater than 0'
      });
    }

    // Get current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('items')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      throw fetchError;
    }

    if (currentItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        message: `Only ${currentItem.quantity} items available`
      });
    }

    // Update quantity
    const newQuantity = Math.max(0, currentItem.quantity - parseInt(quantity));

    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: updatedItem,
      message: `Quantity reduced by ${quantity}. New quantity: ${newQuantity}`
    });
  } catch (error) {
    console.error('Error reducing item quantity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reduce item quantity',
      message: error.message
    });
  }
});

// GET /api/items/low-stock/:threshold - Get low stock items
router.get('/low-stock/:threshold', async (req, res) => {
  try {
    const threshold = parseInt(req.params.threshold) || 10;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .lte('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      threshold
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock items',
      message: error.message
    });
  }
});

export default router;