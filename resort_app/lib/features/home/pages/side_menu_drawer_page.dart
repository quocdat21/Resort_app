import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/home/pages/about_resort_page.dart';
import 'package:resort_app/features/home/pages/contact_page.dart';
import 'package:resort_app/features/home/pages/location_page.dart';

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
      final user = await ApiService.getUser();
      if (mounted) {
        setState(() {
          _userData = user;
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
                          Stack(
                            children: [
                              CircleAvatar(
                                radius: 36,
                                backgroundColor: AppColors.surfaceContainerHigh,
                                backgroundImage:
                                    (_userData?['avatar_url'] != null &&
                                            _userData!['avatar_url'].isNotEmpty)
                                        ? NetworkImage(_userData!['avatar_url'])
                                        : const AssetImage(
                                                "assets/icons/profile.png")
                                            as ImageProvider,
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(
                                        0xFF7D6444), // Brownish color for ELITE
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: AppColors.background, width: 2),
                                  ),
                                  child: Text(
                                    "ELITE",
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
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
                      const SizedBox(height: 4),
                      Text(
                        "ELITE SANCTUARY MEMBER",
                        style: AppTextStyles.labelSmall.copyWith(
                          color: const Color(0xFF7D6444),
                          letterSpacing: 1.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Navigation Links
                      _buildNavItem(
                        icon: Icons.home_outlined,
                        label: "Home",
                        isActive: true,
                        onTap: () => Navigator.pop(context),
                      ),
                      _buildNavItem(
                        icon: Icons.calendar_month_outlined,
                        label: "Bookings",
                        onTap: () {},
                      ),
                      _buildNavItem(
                        icon: Icons.spa_outlined,
                        label: "Services",
                        onTap: () {},
                      ),

                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child:
                            Divider(color: AppColors.outlineVariant, height: 1),
                      ),

                      Text(
                        "MANAGEMENT",
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.outline,
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildNavItem(
                        icon: Icons.history,
                        label: "Booking History",
                        onTap: () {},
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.payments_outlined,
                        label: "Payment History",
                        onTap: () {},
                        isSecondary: true,
                      ),
                      _buildNavItem(
                        icon: Icons.notifications_none,
                        label: "Notifications",
                        onTap: () {},
                        isSecondary: true,
                      ),

                      const SizedBox(height: 24),

                      Text(
                        "RESORT INFO",
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.outline,
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildNavItem(
                        icon: Icons.info_outline,
                        label: "About Resort",
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
                        label: "Location / Map",
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
                        label: "Contact",
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
