const pool = require('../config/db');

const homeController = {
  /**
   * GET /api/home
   * Returns aggregated data for the mobile app home screen:
   * - categories: Room categories with icons
   * - popular_rooms: Top-rated rooms with avg rating & review count
   * - banners: Active vouchers formatted as promotional banners
   */
  getHomeData: async (req, res) => {
    try {
      // 1. Categories - all categories with zone info
      const [categories] = await pool.query(`
        SELECT c.id, c.name, c.icon_url, z.name as zone_name
        FROM Categories c
        LEFT JOIN Zones z ON c.zone_id = z.id
        ORDER BY c.id ASC
      `);

      // 2. Popular Rooms - rooms with average rating, sorted by rating desc
      const [popularRooms] = await pool.query(`
        SELECT 
          r.id,
          r.name,
          (SELECT ri.image_url FROM Room_Images ri WHERE ri.room_id = r.id AND ri.image_url LIKE '%/pr-%' LIMIT 1) as main_image_url,
          r.base_price,
          r.capacity_adults,
          r.capacity_children,
          r.size_sqm,
          c.name as category_name,
          z.name as zone_name,
          COALESCE(AVG(rv.rating), 0) as avg_rating,
          COUNT(rv.id) as review_count
        FROM Rooms r
        LEFT JOIN Categories c ON r.category_id = c.id
        LEFT JOIN Zones z ON c.zone_id = z.id
        LEFT JOIN Room_Numbers rn ON rn.room_id = r.id
        LEFT JOIN Reviews rv ON rv.room_number_id = rn.id
        GROUP BY r.id
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT 10
      `);

      // 3. Banners - active vouchers as promotional banners
      const [banners] = await pool.query(`
        SELECT 
          id,
          code,
          discount_type,
          discount_value,
          max_discount,
          min_order_value,
          start_date,
          end_date
        FROM Vouchers
        WHERE status = 'active'
          AND (end_date IS NULL OR end_date > NOW())
          AND (start_date IS NULL OR start_date <= NOW())
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Format response
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      const formattedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        zone_name: cat.zone_name,
        icon_url: cat.icon_url
          ? (cat.icon_url.startsWith('http') ? cat.icon_url : `${baseUrl}${cat.icon_url}`)
          : null
      }));

      const formattedRooms = popularRooms.map(room => ({
        id: room.id,
        name: room.name,
        main_image_url: room.main_image_url
          ? (room.main_image_url.startsWith('http') ? room.main_image_url : `${baseUrl}${room.main_image_url}`)
          : null,
        base_price: Number(room.base_price),
        capacity_adults: room.capacity_adults,
        capacity_children: room.capacity_children,
        size_sqm: room.size_sqm,
        category_name: room.category_name,
        zone_name: room.zone_name || 'Resort',
        avg_rating: Number(Number(room.avg_rating).toFixed(1)),
        review_count: room.review_count
      }));

      const formattedBanners = banners.map(v => {
        let title = '';
        if (v.discount_type === 'percentage') {
          title = `Giảm ${Number(v.discount_value)}%`;
          if (v.max_discount) {
            title += `\nTối đa ${Number(v.max_discount).toLocaleString('vi-VN')}đ`;
          }
        } else {
          title = `Giảm ${Number(v.discount_value).toLocaleString('vi-VN')}đ`;
        }

        return {
          id: v.id,
          code: v.code,
          title: title,
          discount_type: v.discount_type,
          discount_value: Number(v.discount_value),
          max_discount: v.max_discount ? Number(v.max_discount) : null,
          min_order_value: v.min_order_value ? Number(v.min_order_value) : 0,
          end_date: v.end_date
        };
      });

      res.json({
        success: true,
        data: {
          categories: formattedCategories,
          popular_rooms: formattedRooms,
          banners: formattedBanners
        }
      });
    } catch (error) {
      console.error('Error in getHomeData:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy dữ liệu trang chủ'
      });
    }
  }
};

module.exports = homeController;
