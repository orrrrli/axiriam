import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/order-materials - Get all order materials
router.get('/', async (req, res) => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('order_materials')
      .select(`
        *,
        order_material_groups (
          id,
          quantity,
          order_designs (
            id,
            raw_material_id,
            height,
            width,
            raw_materials (
              id,
              name,
              description
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Transform the data to match frontend expectations
    const transformedOrders = orders?.map(order => ({
      ...order,
      materials: order.order_material_groups?.map(group => ({
        quantity: group.quantity,
        designs: group.order_designs?.map(design => ({
          rawMaterialId: design.raw_material_id,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        })) || []
      })) || []
    })) || [];

    res.json({
      success: true,
      data: transformedOrders,
      count: transformedOrders.length
    });
  } catch (error) {
    console.error('Error fetching order materials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order materials',
      message: error.message
    });
  }
});

// GET /api/order-materials/:id - Get single order material
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabase
      .from('order_materials')
      .select(`
        *,
        order_material_groups (
          id,
          quantity,
          order_designs (
            id,
            raw_material_id,
            height,
            width,
            raw_materials (
              id,
              name,
              description
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw orderError;
    }

    // Transform the data
    const transformedOrder = {
      ...order,
      materials: order.order_material_groups?.map(group => ({
        quantity: group.quantity,
        designs: group.order_designs?.map(design => ({
          rawMaterialId: design.raw_material_id,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        })) || []
      })) || []
    };

    res.json({
      success: true,
      data: transformedOrder
    });
  } catch (error) {
    console.error('Error fetching order material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order material',
      message: error.message
    });
  }
});

// POST /api/order-materials - Create new order material
router.post('/', async (req, res) => {
  try {
    const {
      distributor,
      description = '',
      status = 'pending',
      tracking_number = '',
      estimated_delivery,
      materials = []
    } = req.body;

    // Validation
    if (!distributor) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Distributor is required'
      });
    }

    const validStatuses = ['pending', 'ordered', 'received'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (materials.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No materials provided',
        message: 'At least one material group is required'
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('order_materials')
      .insert([{
        distributor,
        description,
        status,
        tracking_number,
        estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : null
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create material groups and designs
    for (const material of materials) {
      if (!material.quantity || material.quantity <= 0) {
        throw new Error('Material quantity must be greater than 0');
      }

      if (!material.designs || material.designs.length === 0) {
        throw new Error('Each material group must have at least one design');
      }

      // Create material group
      const { data: group, error: groupError } = await supabase
        .from('order_material_groups')
        .insert([{
          order_material_id: order.id,
          quantity: parseInt(material.quantity)
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Create designs for this group
      const designs = material.designs.map(design => ({
        order_material_group_id: group.id,
        raw_material_id: design.rawMaterialId,
        height: parseFloat(design.height),
        width: parseFloat(design.width)
      }));

      const { error: designsError } = await supabase
        .from('order_designs')
        .insert(designs);

      if (designsError) throw designsError;
    }

    // Fetch the complete order
    const { data: completeOrder } = await supabase
      .from('order_materials')
      .select(`
        *,
        order_material_groups (
          id,
          quantity,
          order_designs (
            id,
            raw_material_id,
            height,
            width
          )
        )
      `)
      .eq('id', order.id)
      .single();

    const transformedOrder = {
      ...completeOrder,
      materials: completeOrder.order_material_groups?.map(group => ({
        quantity: group.quantity,
        designs: group.order_designs?.map(design => ({
          rawMaterialId: design.raw_material_id,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        })) || []
      })) || []
    };

    res.status(201).json({
      success: true,
      data: transformedOrder,
      message: 'Order material created successfully'
    });
  } catch (error) {
    console.error('Error creating order material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order material',
      message: error.message
    });
  }
});

// PUT /api/order-materials/:id - Update order material
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      distributor,
      description,
      status,
      tracking_number,
      estimated_delivery,
      materials
    } = req.body;

    // Validation
    if (status) {
      const validStatuses = ['pending', 'ordered', 'received'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // Update order
    const updateData = {};
    if (distributor !== undefined) updateData.distributor = distributor;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (estimated_delivery !== undefined) {
      updateData.estimated_delivery = estimated_delivery ? new Date(estimated_delivery) : null;
    }

    const { data: order, error: orderError } = await supabase
      .from('order_materials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw orderError;
    }

    // Update materials if provided
    if (materials !== undefined) {
      // Delete existing groups and designs (cascade will handle designs)
      await supabase
        .from('order_material_groups')
        .delete()
        .eq('order_material_id', id);

      // Create new material groups and designs
      for (const material of materials) {
        // Create material group
        const { data: group, error: groupError } = await supabase
          .from('order_material_groups')
          .insert([{
            order_material_id: id,
            quantity: parseInt(material.quantity)
          }])
          .select()
          .single();

        if (groupError) throw groupError;

        // Create designs for this group
        const designs = material.designs.map(design => ({
          order_material_group_id: group.id,
          raw_material_id: design.rawMaterialId,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        }));

        const { error: designsError } = await supabase
          .from('order_designs')
          .insert(designs);

        if (designsError) throw designsError;
      }
    }

    // Fetch the complete updated order
    const { data: completeOrder } = await supabase
      .from('order_materials')
      .select(`
        *,
        order_material_groups (
          id,
          quantity,
          order_designs (
            id,
            raw_material_id,
            height,
            width
          )
        )
      `)
      .eq('id', id)
      .single();

    const transformedOrder = {
      ...completeOrder,
      materials: completeOrder.order_material_groups?.map(group => ({
        quantity: group.quantity,
        designs: group.order_designs?.map(design => ({
          rawMaterialId: design.raw_material_id,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        })) || []
      })) || []
    };

    res.json({
      success: true,
      data: transformedOrder,
      message: 'Order material updated successfully'
    });
  } catch (error) {
    console.error('Error updating order material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order material',
      message: error.message
    });
  }
});

// DELETE /api/order-materials/:id - Delete order material
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('order_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Order material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order material',
      message: error.message
    });
  }
});

// GET /api/order-materials/status/:status - Get orders by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ['pending', 'ordered', 'received'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const { data: orders, error } = await supabase
      .from('order_materials')
      .select(`
        *,
        order_material_groups (
          id,
          quantity,
          order_designs (
            id,
            raw_material_id,
            height,
            width
          )
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedOrders = orders?.map(order => ({
      ...order,
      materials: order.order_material_groups?.map(group => ({
        quantity: group.quantity,
        designs: group.order_designs?.map(design => ({
          rawMaterialId: design.raw_material_id,
          height: parseFloat(design.height),
          width: parseFloat(design.width)
        })) || []
      })) || []
    })) || [];

    res.json({
      success: true,
      data: transformedOrders,
      count: transformedOrders.length,
      status
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders by status',
      message: error.message
    });
  }
});

export default router;