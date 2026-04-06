const prisma = require('../config/prisma');

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [
            totalOrders,
            totalProducts,
            lowStockProducts,
            revenueAgg,
            statusGroups,
            recentOrders,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.product.count({ where: { isActive: true, stock: { lt: 5 } } }),
            prisma.order.aggregate({ _sum: { total: true } }),
            prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
            prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    items: {
                        include: { product: { select: { id: true, name: true } } },
                    },
                },
            }),
        ]);

        const ordersByStatus = {};
        for (const row of statusGroups) {
            ordersByStatus[row.status] = row._count.status;
        }

        res.json({
            totalRevenue:    revenueAgg._sum.total ?? 0,
            totalOrders,
            totalProducts,
            lowStockProducts,
            ordersByStatus,
            recentOrders,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

module.exports = { getStats };
