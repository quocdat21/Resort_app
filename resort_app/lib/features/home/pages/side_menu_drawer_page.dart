import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:resort_app/features/home/pages/about_resort_page.dart';
import 'package:resort_app/features/home/pages/contact_page.dart';
import 'package:resort_app/features/home/pages/location_page.dart';
import 'package:resort_app/features/booking/pages/booking_history.dart';
import 'package:resort_app/features/payment/pages/payment_history.dart';
import 'package:resort_app/features/room/pages/rooms_search_results.dart';
import 'package:resort_app/features/service/pages/services_page.dart';
import 'package:resort_app/features/profile/pages/profile_page.dart';

class SideMenuDrawerPage extends StatefulWidget {
  const SideMenuDrawerPage({super.key});

  @override
  State<SideMenuDrawerPage> createState() => _SideMenuDrawerPageState();
}

class _SideMenuDrawerPageState extends State<SideMenuDrawerPage> {
  Map<String, dynamic>? _userData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      // First show cached data
      final user = await ApiService.getUser();
      if (user != null && mounted) {
        setState(() {
          _userData = user;
          _isLoading = false;
        });
      }

      // Then fetch fresh data from server
      final response = await ApiService.fetchMe();
      if (response['success'] == true && mounted) {
        setState(() {
          _userData = response['data'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = _userData?['full_name'] ?? 'Erro';
    final String email = _userData?['email'] ?? 'Erro@resort.vn';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
      child: Drawer(
        backgroundColor: AppColors.background,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topRight: Radius.circular(32),
            bottomRight: Radius.circular(32),
          ),
        ),
        child: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Profile Section
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(context); // Close drawer
                              Navigator.pushReplacement(
                                context,
                                PageRouteBuilder(
                                  pageBuilder: (_, __, ___) => const ProfilePage(),
                                  transitionDuration: Duration.zero,
                                ),
                              );
                            },
                            child: CircleAvatar(
                              radius: 36,
                              backgroundColor: AppColors.surfaceContainerHigh,
                              backgroundImage: (_userData?['avatar_url'] != null &&
                                      _userData!['avatar_url'].isNotEmpty)
                                  ? CachedNetworkImageProvider(
                                      ApiService.fixImageUrl(
                                          _userData!['avatar_url']),
                                      headers: ApiService.imageHeaders)
                                  : const AssetImage("assets/icons/profile.png")
                                      as ImageProvider,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        fullName,
                        style: AppTextStyles.h2.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        email,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Navigation Links
                      _buildNavItem(
                        icon: Icons.home_outlined,
                        label: AppStrings.get(context, 'home'),
                        isActive: true,
                        onTap: () => Navigator.pop(context),
                      ),
                      _buildNavItem(
                        icon: Icons.calendar_month_outlined,
                        label: AppStrings.get(context, 'bookings'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushReplacement(
                            context,
                            PageRouteBuilder(
                              pageBuilder: (_, __, ___) =>
                                  const RoomsSearchResults(),
                              transitionDuration: Duration.zero,
                            ),
                          );
                        },
                      ),
                      _buildNavItem(
                        icon: Icons.spa_outlined,
                        label: AppStrings.get(context, 'services'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushReplacement(
                            context,
                            PageRouteBuilder(
                              pageBuilder: (_, __, ___) => const ServicesPage(),
                              transitionDuration: Duration.zero,
                            ),
                          );
                        },
                      ),

                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child:
                            Divider(color: AppColors.outlineVariant, height: 1),
                      ),

                      Text(
                        AppStrings.get(context, 'management'),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.outline,
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildNavItem(
                        icon: Icons.history,
                        label: AppStrings.get(context, 'booking_history'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    const BookingHistoryPage()),
                          );
                        },
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.payments_outlined,
                        label: AppStrings.get(context, 'payment_history'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    const PaymentHistoryPage()),
                          );
                        },
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.notifications_none,
                        label: AppStrings.get(context, 'notifications'),
                        onTap: () {},
                        isSecondary: true,
                      ),

                      const SizedBox(height: 24),

                      Text(
                        AppStrings.get(context, 'resort_info'),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.outline,
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildNavItem(
                        icon: Icons.info_outline,
                        label: AppStrings.get(context, 'about_resort'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const AboutResortPage()),
                          );
                        },
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.map_outlined,
                        label: AppStrings.get(context, 'location'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const LocationPage()),
                          );
                        },
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.help_outline,
                        label: AppStrings.get(context, 'contact_us'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const ContactPage()),
                          );
                        },
                        isSecondary: true,
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isActive = false,
    bool isSecondary = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: isActive
                  ? Colors.white
                  : (isSecondary ? AppColors.outline : AppColors.primary),
            ),
            const SizedBox(width: 16),
            Text(
              label,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: isActive
                    ? Colors.white
                    : (isSecondary
                        ? AppColors.onSurfaceVariant
                        : AppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
