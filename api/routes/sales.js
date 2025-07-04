import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/sales - Get all sales
router.get('/', async (req, res) => {
  try {
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          item_id,
          quantity,
          items (
            id,
            name,
            price
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (salesError) throw salesError;

    // Transform the data to match frontend expectations
    const transformedSales = sales?.map(sale => ({
      ...sale,
      items: sale.sale_items?.map(si => si.item_id) || []
    })) || [];

    res.json({
      success: true,
      data: transformedSales,
      count: transformedSales.length
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales',
      message: error.message
    });
  }
});

// GET /api/sales/:id - Get single sale
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          item_id,
          quantity,
          items (
            id,
            name,
            price
          )
        )
      `)
      .eq('id', id)
      .single();

    if (saleError) {
      if (saleError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Sale not found'
        });
      }
      throw saleError;
    }

    // Transform the data
    const transformedSale = {
      ...sale,
      items: sale.sale_items?.map(si => si.item_id) || []
    };

    res.json({
      success: true,
      data: transformedSale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sale',
      message: error.message
    });
  }
});

// POST /api/sales - Create new sale
router.post('/', async (req, res) => {
  try {
    const {
      name,
      status = 'pending',
      social_media_platform,
      social_media_username,
      tracking_number = '',
      invoice_required = false,
      shipping_type,
      local_shipping_option,
      local_address = '',
      national_shipping_carrier,
      shipping_description = '',
      total_amount = 0,
      items = []
    } = req.body;

    // Validation
    if (!name || !social_media_platform || !social_media_username || !shipping_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, social media platform, username, and shipping type are required'
      });
    }

    const validStatuses = ['pending', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const validPlatforms = ['facebook', 'instagram', 'whatsapp'];
    if (!validPlatforms.includes(social_media_platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid social media platform',
        message: `Platform must be one of: ${validPlatforms.join(', ')}`
      });
    }

    const validShippingTypes = ['local', 'nacional'];
    if (!validShippingTypes.includes(shipping_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shipping type',
        message: `Shipping type must be one of: ${validShippingTypes.join(', ')}`
      });
    }

    if (total_amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total amount',
        message: 'Total amount cannot be negative'
      });
    }

    // Validate shipping options
    if (shipping_type === 'local' && local_shipping_option) {
      const validLocalOptions = ['meeting-point', 'pzexpress'];
      if (!validLocalOptions.includes(local_shipping_option)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid local shipping option',
          message: `Local shipping option must be one of: ${validLocalOptions.join(', ')}`
        });
      }
    }

    if (shipping_type === 'nacional' && national_shipping_carrier) {
      const validCarriers = ['estafeta', 'dhl', 'fedex', 'correos'];
      if (!validCarriers.includes(national_shipping_carrier)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid shipping carrier',
          message: `Shipping carrier must be one of: ${validCarriers.join(', ')}`
        });
      }
    }

    // Check item availability and reduce quantities
    for (const itemId of items) {
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('quantity')
        .eq('id', itemId)
        .single();

      if (itemError) {
        throw new Error(`Item ${itemId} not found`);
      }

      if (item.quantity <= 0) {
        throw new Error(`Item ${itemId} is out of stock`);
      }

      // Reduce item quantity
      const { error: updateError } = await supabase
        .from('items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', itemId);

      if (updateError) throw updateError;
    }

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        name,
        status,
        social_media_platform,
        social_media_username,
        tracking_number,
        invoice_required,
        shipping_type,
        local_shipping_option,
        local_address,
        national_shipping_carrier,
        shipping_description,
        total_amount: parseFloat(total_amount)
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Add sale items
    if (items.length > 0) {
      const saleItems = items.map(itemId => ({
        sale_id: sale.id,
        item_id: itemId,
        quantity: 1
      }));

      const { error: saleItemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (saleItemsError) throw saleItemsError;
    }

    // Fetch the complete sale
    const { data: completeSale } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          item_id,
          quantity
        )
      `)
      .eq('id', sale.id)
      .single();

    const transformedSale = {
      ...completeSale,
      items: completeSale.sale_items?.map(si => si.item_id) || []
    };

    res.status(201).json({
      success: true,
      data: transformedSale,
      message: 'Sale created successfully'
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sale',
      message: error.message
    });
  }
});

// PUT /api/sales/:id - Update sale
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      status,
      social_media_platform,
      social_media_username,
      tracking_number,
      invoice_required,
      shipping_type,
      local_shipping_option,
      local_address,
      national_shipping_carrier,
      shipping_description,
      total_amount,
      items
    } = req.body;

    // Validation
    if (status) {
      const validStatuses = ['pending', 'shipped', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    if (social_media_platform) {
      const validPlatforms = ['facebook', 'instagram', 'whatsapp'];
      if (!validPlatforms.includes(social_media_platform)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid social media platform',
          message: `Platform must be one of: ${validPlatforms.join(', ')}`
        });
      }
    }

    if (shipping_type) {
      const validShippingTypes = ['local', 'nacional'];
      if (!validShippingTypes.includes(shipping_type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid shipping type',
          message: `Shipping type must be one of: ${validShippingTypes.join(', ')}`
        });
      }
    }

    if (total_amount !== undefined && total_amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total amount',
        message: 'Total amount cannot be negative'
      });
    }

    // Handle item quantity changes if items are being updated
    if (items !== undefined) {
      // Get current sale items
      const { data: currentSaleItems } = await supabase
        .from('sale_items')
        .select('item_id')
        .eq('sale_id', id);

      const currentItemIds = currentSaleItems?.map(si => si.item_id) || [];

      // Restore quantities for removed items
      for (const itemId of currentItemIds) {
        if (!items.includes(itemId)) {
          const { data: item } = await supabase
            .from('items')
            .select('quantity')
            .eq('id', itemId)
            .single();

          if (item) {
            await supabase
              .from('items')
              .update({ quantity: item.quantity + 1 })
              .eq('id', itemId);
          }
        }
      }

      // Reduce quantities for new items
      for (const itemId of items) {
        if (!currentItemIds.includes(itemId)) {
          const { data: item } = await supabase
            .from('items')
            .select('quantity')
            .eq('id', itemId)
            .single();

          if (!item) {
            throw new Error(`Item ${itemId} not found`);
          }

          if (item.quantity <= 0) {
            throw new Error(`Item ${itemId} is out of stock`);
          }

          await supabase
            .from('items')
            .update({ quantity: item.quantity - 1 })
            .eq('id', itemId);
        }
      }

      // Update sale items
      await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', id);

      if (items.length > 0) {
        const saleItems = items.map(itemId => ({
          sale_id: id,
          item_id: itemId,
          quantity: 1
        }));

        await supabase
          .from('sale_items')
          .insert(saleItems);
      }
    }

    // Update sale
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (social_media_platform !== undefined) updateData.social_media_platform = social_media_platform;
    if (social_media_username !== undefined) updateData.social_media_username = social_media_username;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (invoice_required !== undefined) updateData.invoice_required = invoice_required;
    if (shipping_type !== undefined) updateData.shipping_type = shipping_type;
    if (local_shipping_option !== undefined) updateData.local_shipping_option = local_shipping_option;
    if (local_address !== undefined) updateData.local_address = local_address;
    if (national_shipping_carrier !== undefined) updateData.national_shipping_carrier = national_shipping_carrier;
    if (shipping_description !== undefined) updateData.shipping_description = shipping_description;
    if (total_amount !== undefined) updateData.total_amount = parseFloat(total_amount);

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (saleError) {
      if (saleError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Sale not found'
        });
      }
      throw saleError;
    }

    // Fetch the complete updated sale
    const { data: completeSale } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          item_id,
          quantity
        )
      `)
      .eq('id', id)
      .single();

    const transformedSale = {
      ...completeSale,
      items: completeSale.sale_items?.map(si => si.item_id) || []
    };

    res.json({
      success: true,
      data: transformedSale,
      message: 'Sale updated successfully'
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sale',
      message: error.message
    });
  }
});

// DELETE /api/sales/:id - Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get sale items to restore quantities
    const { data: saleItems } = await supabase
      .from('sale_items')
      .select('item_id, quantity')
      .eq('sale_id', id);

    // Restore item quantities
    if (saleItems) {
      for (const saleItem of saleItems) {
        const { data: item } = await supabase
          .from('items')
          .select('quantity')
          .eq('id', saleItem.item_id)
          .single();

        if (item) {
          await supabase
            .from('items')
            .update({ quantity: item.quantity + saleItem.quantity })
            .eq('id', saleItem.item_id);
        }
      }
    }

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sale',
      message: error.message
    });
  }
});

// GET /api/sales/status/:status - Get sales by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ['pending', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          item_id,
          quantity
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedSales = sales?.map(sale => ({
      ...sale,
      items: sale.sale_items?.map(si => si.item_id) || []
    })) || [];

    res.json({
      success: true,
      data: transformedSales,
      count: transformedSales.length,
      status
    });
  } catch (error) {
    console.error('Error fetching sales by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales by status',
      message: error.message
    });
  }
});

export default router;