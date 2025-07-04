import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total counts
    const [
      { count: totalItems },
      { count: totalMaterials },
      { count: totalOrders },
      { count: totalSales }
    ] = await Promise.all([
      supabase.from('items').select('*', { count: 'exact', head: true }),
      supabase.from('raw_materials').select('*', { count: 'exact', head: true }),
      supabase.from('order_materials').select('*', { count: 'exact', head: true }),
      supabase.from('sales').select('*', { count: 'exact', head: true })
    ]);

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('order_materials')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get low stock items (threshold: 10)
    const { count: lowStockItems } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', 10);

    // Get low stock materials (threshold: 3)
    const { count: lowStockMaterials } = await supabase
      .from('raw_materials')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', 3);

    // Get total designs count
    const { count: totalDesigns } = await supabase
      .from('order_designs')
      .select('*', { count: 'exact', head: true });

    // Get sales by status
    const [
      { count: pendingSales },
      { count: shippedSales },
      { count: deliveredSales }
    ] = await Promise.all([
      supabase.from('sales').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('sales').select('*', { count: 'exact', head: true }).eq('status', 'shipped'),
      supabase.from('sales').select('*', { count: 'exact', head: true }).eq('status', 'delivered')
    ]);

    // Get total revenue
    const { data: salesData } = await supabase
      .from('sales')
      .select('total_amount');

    const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        totals: {
          items: totalItems || 0,
          materials: totalMaterials || 0,
          orders: totalOrders || 0,
          sales: totalSales || 0,
          designs: totalDesigns || 0,
          revenue: totalRevenue
        },
        alerts: {
          pendingOrders: pendingOrders || 0,
          lowStockItems: lowStockItems || 0,
          lowStockMaterials: lowStockMaterials || 0,
          totalLowStock: (lowStockItems || 0) + (lowStockMaterials || 0)
        },
        salesByStatus: {
          pending: pendingSales || 0,
          shipped: shippedSales || 0,
          delivered: deliveredSales || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

// GET /api/dashboard/category-distribution - Get item category distribution
router.get('/category-distribution', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('items')
      .select('category');

    if (error) throw error;

    const distribution = items?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category distribution',
      message: error.message
    });
  }
});

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent items
    const { data: recentItems } = await supabase
      .from('items')
      .select('id, name, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Get recent materials
    const { data: recentMaterials } = await supabase
      .from('raw_materials')
      .select('id, name, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('order_materials')
      .select('id, distributor, status, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Get recent sales
    const { data: recentSales } = await supabase
      .from('sales')
      .select('id, name, sale_id, status, total_amount, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Combine and sort all activities
    const activities = [
      ...(recentItems?.map(item => ({
        id: item.id,
        type: 'item',
        title: item.name,
        subtitle: 'Item updated',
        timestamp: item.updated_at,
        created_at: item.created_at
      })) || []),
      ...(recentMaterials?.map(material => ({
        id: material.id,
        type: 'material',
        title: material.name,
        subtitle: 'Material updated',
        timestamp: material.updated_at,
        created_at: material.created_at
      })) || []),
      ...(recentOrders?.map(order => ({
        id: order.id,
        type: 'order',
        title: `Order from ${order.distributor}`,
        subtitle: `Status: ${order.status}`,
        timestamp: order.updated_at,
        created_at: order.created_at
      })) || []),
      ...(recentSales?.map(sale => ({
        id: sale.id,
        type: 'sale',
        title: `Sale to ${sale.name}`,
        subtitle: `${sale.sale_id} - $${sale.total_amount}`,
        timestamp: sale.updated_at,
        created_at: sale.created_at
      })) || [])
    ];

    // Sort by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      message: error.message
    });
  }
});

// GET /api/dashboard/low-stock - Get low stock items and materials
router.get('/low-stock', async (req, res) => {
  try {
    const itemThreshold = parseInt(req.query.itemThreshold) || 10;
    const materialThreshold = parseInt(req.query.materialThreshold) || 3;

    // Get low stock items
    const { data: lowStockItems } = await supabase
      .from('items')
      .select('id, name, quantity, category')
      .lte('quantity', itemThreshold)
      .order('quantity', { ascending: true });

    // Get low stock materials
    const { data: lowStockMaterials } = await supabase
      .from('raw_materials')
      .select('id, name, quantity, unit')
      .lte('quantity', materialThreshold)
      .order('quantity', { ascending: true });

    res.json({
      success: true,
      data: {
        items: lowStockItems || [],
        materials: lowStockMaterials || [],
        thresholds: {
          items: itemThreshold,
          materials: materialThreshold
        }
      }
    });
  } catch (error) {
    console.error('Error fetching low stock data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock data',
      message: error.message
    });
  }
});

// GET /api/dashboard/sales-summary - Get sales summary
router.get('/sales-summary', async (req, res) => {
  try {
    const { data: sales } = await supabase
      .from('sales')
      .select('total_amount, status, created_at');

    if (!sales) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 0,
          averageOrderValue: 0,
          salesCount: 0,
          monthlyRevenue: 0
        }
      });
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = sales
      .filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        averageOrderValue,
        salesCount: sales.length,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales summary',
      message: error.message
    });
  }
});

export default router;