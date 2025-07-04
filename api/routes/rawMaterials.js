import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/raw-materials - Get all raw materials
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch raw materials',
      message: error.message
    });
  }
});

// GET /api/raw-materials/:id - Get single raw material
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Raw material not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching raw material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch raw material',
      message: error.message
    });
  }
});

// POST /api/raw-materials - Create new raw material
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description = '',
      width,
      height,
      quantity = 0,
      unit = 'm²',
      price = 0,
      supplier = '',
      image_url = ''
    } = req.body;

    // Validation
    if (!name || !width || !height) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, width, and height are required'
      });
    }

    if (width <= 0 || height <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dimensions',
        message: 'Width and height must be greater than 0'
      });
    }

    if (quantity < 0 || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid values',
        message: 'Quantity and price cannot be negative'
      });
    }

    const { data, error } = await supabase
      .from('raw_materials')
      .insert([{
        name,
        description,
        width: parseFloat(width),
        height: parseFloat(height),
        quantity: parseFloat(quantity),
        unit,
        price: parseFloat(price),
        supplier,
        image_url
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Raw material created successfully'
    });
  } catch (error) {
    console.error('Error creating raw material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create raw material',
      message: error.message
    });
  }
});

// PUT /api/raw-materials/:id - Update raw material
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      width,
      height,
      quantity,
      unit,
      price,
      supplier,
      image_url
    } = req.body;

    // Validation
    if (width !== undefined && width <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid width',
        message: 'Width must be greater than 0'
      });
    }

    if (height !== undefined && height <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid height',
        message: 'Height must be greater than 0'
      });
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (width !== undefined) updateData.width = parseFloat(width);
    if (height !== undefined) updateData.height = parseFloat(height);
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (supplier !== undefined) updateData.supplier = supplier;
    if (image_url !== undefined) updateData.image_url = image_url;

    const { data, error } = await supabase
      .from('raw_materials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Raw material not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'Raw material updated successfully'
    });
  } catch (error) {
    console.error('Error updating raw material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update raw material',
      message: error.message
    });
  }
});

// DELETE /api/raw-materials/:id - Delete raw material
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if material is used in any items
    const { data: itemMaterials, error: checkError } = await supabase
      .from('item_materials')
      .select('id')
      .eq('raw_material_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (itemMaterials && itemMaterials.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete material',
        message: 'This material is used in one or more items'
      });
    }

    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Raw material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting raw material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete raw material',
      message: error.message
    });
  }
});

// GET /api/raw-materials/low-stock/:threshold - Get low stock materials
router.get('/low-stock/:threshold', async (req, res) => {
  try {
    const threshold = parseFloat(req.params.threshold) || 3;

    const { data, error } = await supabase
      .from('raw_materials')
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
    console.error('Error fetching low stock materials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock materials',
      message: error.message
    });
  }
});

export default router;