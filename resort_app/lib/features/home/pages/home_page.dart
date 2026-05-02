import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/home/pages/side_menu_drawer_page.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/room/pages/rooms_search.dart';
import 'package:resort_app/features/room/pages/room_details_page.dart';
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
  String? _selectedCategoryKey = 'All';

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

  Future<void> _fetchHomeData() async {
    try {
      final response = await ApiService.fetchHomeData();
      if (response['success'] == true && mounted) {
        final data = response['data'];

        // Fix image URLs in categories
        final cats = List<Map<String, dynamic>>.from(data['categories'] ?? []);
        for (var cat in cats) {
          if (cat['icon_url'] != null) {
            cat['icon_url'] = ApiService.fixImageUrl(cat['icon_url']);
          }
        }

        // Fix image URLs in popular rooms
        final rooms =
            List<Map<String, dynamic>>.from(data['popular_rooms'] ?? []);
        for (var room in rooms) {
          if (room['main_image_url'] != null) {
            room['main_image_url'] = ApiService.fixImageUrl(room['main_image_url']);
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
    return formatter
        .format(price is int ? price : int.tryParse(price.toString()) ?? 0);
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
                    ? NetworkImage(ApiService.fixImageUrl(_avatarUrl!))
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
          AppStrings.get(context, 'welcome'),
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "${AppStrings.get(context, 'hello')}, $_userName",
          style: AppTextStyles.h2.copyWith(
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  // ================= SEARCH =================
  Widget _buildSearch() {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const RoomsSearch()),
        );
      },
      child: AbsorbPointer(
        child: TextField(
          readOnly: true,
          decoration: InputDecoration(
            hintText: AppStrings.get(context, 'search_hint'),
            prefixIcon: const Icon(Icons.search),
            filled: true,
            fillColor: AppColors.surfaceContainerHigh,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ),
    );
  }

  // ================= BANNER =================
  Widget _buildBanner() {
    if (_isLoadingHome) {
      return const SizedBox(
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                    child: Text(
                      AppStrings.get(context, 'promotion'),
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

    // The representative categories including 'All'
    final displayCategories = [
      {'key': 'All', 'label': AppStrings.get(context, 'all'), 'icon': Icons.apps},
      {'key': 'Twin', 'label': AppStrings.get(context, 'twin'), 'icon': Icons.bed},
      {'key': 'Double', 'label': AppStrings.get(context, 'double'), 'icon': Icons.king_bed},
      {'key': 'Triple', 'label': AppStrings.get(context, 'triple'), 'icon': Icons.bedroom_parent},
      {'key': 'Villa', 'label': AppStrings.get(context, 'villa'), 'icon': Icons.villa},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppStrings.get(context, 'categories'),
          style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: displayCategories.length,
            itemBuilder: (_, i) {
              final cat = displayCategories[i];
              final iconData = cat['icon'] as IconData;

              final isSelected = _selectedCategoryKey == cat['key'];

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategoryKey = cat['key'] as String;
                  });
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 20),
                  child: Column(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.surfaceContainerHigh.withOpacity(0.5),
                        ),
                        child: Icon(
                          iconData,
                          color: isSelected
                              ? AppColors.onPrimary
                              : AppColors.primary,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        (cat['label'] as String).toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      )
                    ],
                  ),
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
      return const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Popular Stays", style: AppTextStyles.h3),
          SizedBox(height: 12),
          Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
        ],
      );
    }

    final filteredRooms = _selectedCategoryKey == 'All'
        ? _popularRooms
        : _popularRooms.where((room) {
            final catName =
                (room['category_name'] ?? '').toString().toLowerCase();
            return catName.contains((_selectedCategoryKey ?? '').toLowerCase());
          }).toList();

    if (filteredRooms.isEmpty) {
      return const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Popular Stays", style: AppTextStyles.h3),
          SizedBox(height: 12),
          Center(
            child: Padding(
              padding: EdgeInsets.all(20),
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
        Text(AppStrings.get(context, 'popular_stays'), style: AppTextStyles.h3),
        const SizedBox(height: 12),
        ...List.generate(
          filteredRooms.length,
          (i) => _roomCard(filteredRooms[i]),
        ),
      ],
    );
  }

  void _navigateToRoomDetails(Map<String, dynamic> room) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RoomDetailsPage(room: room),
      ),
    );
  }

  Widget _roomCard(Map<String, dynamic> room) {
    final imageUrl = room['main_image_url'];
    final avgRating = (room['avg_rating'] ?? 0).toDouble();
    final zoneName = (room['zone_name'] ?? 'Resort').toString().toUpperCase();
    final price = room['base_price'] ?? 0;

    return GestureDetector(
      onTap: () => _navigateToRoomDetails(room),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.outlineVariant.withOpacity(0.5)),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.horizontal(left: Radius.circular(16)),
              child: Image.network(
                ApiService.fixImageUrl(imageUrl),
                width: 120,
                height: 120,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 120,
                  color: AppColors.surfaceContainerHigh,
                  child: const Icon(Icons.hotel),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      room['name'] ?? 'Unknown Room',
                      style: AppTextStyles.bodyLarge
                          .copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '$avgRating • $zoneName',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.secondary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      NumberFormat.currency(locale: 'vi_VN', symbol: '₫')
                          .format(price),
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
