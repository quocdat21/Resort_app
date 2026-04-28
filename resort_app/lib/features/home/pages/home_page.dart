import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/home/pages/side_menu_drawer_page.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatefulWidget {
  final String userName;

  const HomeScreen({super.key, this.userName = 'Traveler'});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _userName = '';
  String? _avatarUrl;

  // Home data from API
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _popularRooms = [];
  List<Map<String, dynamic>> _banners = [];
  bool _isLoadingHome = true;

  @override
  void initState() {
    super.initState();
    _userName = widget.userName;
    _fetchUserName();
    _fetchHomeData();
  }

  Future<void> _fetchUserName() async {
    // Attempt to load from local storage first
    if (_userName == 'Traveler') {
      final user = await ApiService.getUser();
      if (user != null && mounted) {
        setState(() {
          _userName = user['full_name'] ?? 'Traveler';
          _avatarUrl = user['avatar_url'];
        });
      }
    }

    // Fetch the latest from API to ensure it's up to date after edits
    try {
      final response = await ApiService.fetchMe();
      if (response['success'] == true && mounted) {
        final data = response['data'];
        if (data != null) {
          setState(() {
            _userName = data['full_name'] ?? _userName;
            _avatarUrl = data['avatar_url'] ?? _avatarUrl;
          });
        }
      }
    } catch (e) {
      // Keep existing name if fetch fails
    }
  }
  /// Replaces localhost URLs from the API with the actual device-accessible server URL
  String _fixImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    return url.replaceAll('http://localhost:3000', ApiService.serverUrl);
  }

  Future<void> _fetchHomeData() async {
    try {
      final response = await ApiService.fetchHomeData();
      if (response['success'] == true && mounted) {
        final data = response['data'];

        // Fix image URLs in categories
        final cats = List<Map<String, dynamic>>.from(data['categories'] ?? []);
        for (var cat in cats) {
          if (cat['icon_url'] != null) {
            cat['icon_url'] = _fixImageUrl(cat['icon_url']);
          }
        }

        // Fix image URLs in popular rooms
        final rooms = List<Map<String, dynamic>>.from(data['popular_rooms'] ?? []);
        for (var room in rooms) {
          if (room['main_image_url'] != null) {
            room['main_image_url'] = _fixImageUrl(room['main_image_url']);
          }
        }

        setState(() {
          _categories = cats;
          _popularRooms = rooms;
          _banners = List<Map<String, dynamic>>.from(data['banners'] ?? []);
          _isLoadingHome = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching home data: $e');
      if (mounted) {
        setState(() {
          _isLoadingHome = false;
        });
      }
    }
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final formatter = NumberFormat('#,###', 'vi_VN');
    return formatter.format(price is int ? price : int.tryParse(price.toString()) ?? 0);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark, // Android
        statusBarBrightness: Brightness.light, // iOS
      ),
      child: Scaffold(
        backgroundColor: AppColors.surface,
        drawer: const SideMenuDrawerPage(),
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _fetchHomeData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        _buildWelcome(),
                        const SizedBox(height: 16),
                        _buildSearch(),
                        const SizedBox(height: 20),
                        _buildBanner(),
                        const SizedBox(height: 20),
                        _buildCategories(),
                        const SizedBox(height: 20),
                        _buildPopular(),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 0),
      ),
    );
  }

  // ================= HEADER =================
  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Builder(
                builder: (context) => InkWell(
                  onTap: () => Scaffold.of(context).openDrawer(),
                  child: const Icon(Icons.menu),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                "Thao Nguyen Resort",
                style: AppTextStyles.h3.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              )
            ],
          ),
          Row(
            children: [
              const Stack(
                children: [
                  Icon(Icons.notifications),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: CircleAvatar(
                      radius: 4,
                      backgroundColor: AppColors.secondary,
                    ),
                  )
                ],
              ),
              const SizedBox(width: 12),
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surfaceContainerHigh,
                backgroundImage: (_avatarUrl != null && _avatarUrl!.isNotEmpty)
                    ? NetworkImage(_avatarUrl!)
                    : const AssetImage("assets/icons/profile.png")
                        as ImageProvider,
              )
            ],
          )
        ],
      ),
    );
  }

  // ================= WELCOME =================
  Widget _buildWelcome() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "WELCOME TO THE HIGHLANDS",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "Hello, $_userName",
          style: AppTextStyles.h2.copyWith(
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  // ================= SEARCH =================
  Widget _buildSearch() {
    return TextField(
      decoration: InputDecoration(
        hintText: "Search experiences...",
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: AppColors.surfaceContainerHigh,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  // ================= BANNER =================
  Widget _buildBanner() {
    if (_isLoadingHome) {
      return SizedBox(
        height: 180,
        child: Center(
          child: CircularProgressIndicator(
            color: AppColors.primary,
            strokeWidth: 2,
          ),
        ),
      );
    }

    if (_banners.isEmpty) {
      return SizedBox(
        height: 180,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            _bannerItem(
              title: "Thao Nguyen Resort\nChào mừng bạn!",
              gradientColors: [AppColors.primary, AppColors.primaryContainer],
            ),
          ],
        ),
      );
    }

    return SizedBox(
      height: 180,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _banners.length,
        itemBuilder: (_, i) {
          final banner = _banners[i];
          final colors = [
            [const Color(0xFF334F2B), const Color(0xFF4A6741)],
            [const Color(0xFF715A3E), const Color(0xFF8B7355)],
            [const Color(0xFF1C4F51), const Color(0xFF366769)],
            [const Color(0xFF4A3728), const Color(0xFF6B5340)],
            [const Color(0xFF2D3A4A), const Color(0xFF445566)],
          ];
          final colorPair = colors[i % colors.length];

          return _bannerItem(
            title: banner['title'] ?? '',
            subtitle: 'Mã: ${banner['code']}',
            gradientColors: colorPair,
          );
        },
      ),
    );
  }

  Widget _bannerItem({
    required String title,
    String? subtitle,
    required List<Color> gradientColors,
  }) {
    return Container(
      width: 300,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: gradientColors[0].withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Decorative circles
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
          ),
          Positioned(
            right: 30,
            bottom: -30,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.08),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'KHUYẾN MÃI',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Colors.white,
                      fontSize: 9,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: AppTextStyles.h3.copyWith(
                    color: Colors.white,
                    fontSize: 18,
                    height: 1.3,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.white.withOpacity(0.8),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ================= CATEGORIES =================
  Widget _buildCategories() {
    if (_isLoadingHome) {
      return const SizedBox.shrink();
    }

    // Fallback icons if no icon_url is provided from the backend
    final fallbackIcons = [
      Icons.villa,
      Icons.bed,
      Icons.houseboat,
      Icons.cabin,
      Icons.home_work,
      Icons.apartment,
      Icons.house,
      Icons.holiday_village,
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Room Categories", style: AppTextStyles.h3),
        const SizedBox(height: 12),
        SizedBox(
          height: 90,
          child: _categories.isEmpty
              ? Center(
                  child: Text(
                    'Chưa có danh mục phòng',
                    style: AppTextStyles.bodySmall,
                  ),
                )
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  itemBuilder: (_, i) {
                    final cat = _categories[i];
                    final iconUrl = cat['icon_url'];

                    return Container(
                      margin: const EdgeInsets.only(right: 12),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: i == 0
                                ? AppColors.primary
                                : AppColors.surfaceContainerHigh,
                            backgroundImage: (iconUrl != null && iconUrl.toString().isNotEmpty)
                                ? NetworkImage(iconUrl)
                                : null,
                            child: (iconUrl == null || iconUrl.toString().isEmpty)
                                ? Icon(
                                    fallbackIcons[i % fallbackIcons.length],
                                    color: i == 0
                                        ? AppColors.onPrimary
                                        : AppColors.primary,
                                  )
                                : null,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            (cat['name'] ?? '').toString().toUpperCase(),
                            style: AppTextStyles.labelSmall,
                          )
                        ],
                      ),
                    );
                  },
                ),
        )
      ],
    );
  }

  // ================= POPULAR =================
  Widget _buildPopular() {
    if (_isLoadingHome) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Popular Stays", style: AppTextStyles.h3),
          const SizedBox(height: 12),
          Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
        ],
      );
    }

    if (_popularRooms.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Popular Stays", style: AppTextStyles.h3),
          const SizedBox(height: 12),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                'Chưa có phòng nào',
                style: AppTextStyles.bodySmall,
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Popular Stays", style: AppTextStyles.h3),
        const SizedBox(height: 12),
        ...List.generate(
          _popularRooms.length,
          (i) => _roomCard(_popularRooms[i]),
        ),
      ],
    );
  }

  Widget _roomCard(Map<String, dynamic> room) {
    final imageUrl = room['main_image_url'];
    final avgRating = (room['avg_rating'] ?? 0).toDouble();
    final zoneName = (room['zone_name'] ?? 'Resort').toString().toUpperCase();
    final price = room['base_price'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: imageUrl != null && imageUrl.toString().isNotEmpty
                ? Image.network(
                    imageUrl,
                    width: 110,
                    height: 110,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 110,
                      height: 110,
                      color: AppColors.surfaceContainerHigh,
                      child: const Icon(Icons.image_not_supported, color: AppColors.outline),
                    ),
                  )
                : Container(
                    width: 110,
                    height: 110,
                    color: AppColors.surfaceContainerHigh,
                    child: const Icon(Icons.hotel, color: AppColors.outline, size: 32),
                  ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    room['name'] ?? '',
                    style: AppTextStyles.h3.copyWith(fontSize: 16),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.orange),
                      const SizedBox(width: 4),
                      Text(
                        "${avgRating > 0 ? avgRating.toStringAsFixed(1) : 'Mới'} · $zoneName",
                        style: AppTextStyles.bodySmall,
                      )
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "${_formatPrice(price)}đ / ĐÊM",
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
