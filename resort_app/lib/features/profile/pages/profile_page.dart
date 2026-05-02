import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/features/auth/pages/login_page.dart';
import 'package:resort_app/features/booking/pages/booking_history.dart';
import 'package:resort_app/features/payment/pages/payment_history.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/profile/pages/edit_profile_page.dart';
import 'package:resort_app/features/profile/pages/settings_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? _userData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      final response = await ApiService.fetchMe();
      if (mounted) {
        setState(() {
          if (response['success'] == true) {
            _userData = response['data'];
          }
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
    final String fullName = _userData?['full_name'] ?? 'Loading...';
    final String email = _userData?['email'] ?? 'Loading...';
    final int loyaltyPoints = _userData?['loyalty_points'] ?? 0;
    final int totalStays = _userData?['total_stays'] ?? 0;
    final String avatarUrl = _userData?['avatar_url'] ?? '';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.surface,
        body: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    children: [
                      // Avatar and Info
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: AppColors.secondaryContainer,
                                  width: 4),
                              image: avatarUrl.isNotEmpty
                                  ? DecorationImage(
                                      image: NetworkImage(ApiService.fixImageUrl(avatarUrl)),
                                      fit: BoxFit.cover,
                                    )
                                  : const DecorationImage(
                                      image: AssetImage(
                                          "assets/icons/profile.png"),
                                      fit: BoxFit.cover,
                                    ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: const Color(0xFF7D6444),
                                shape: BoxShape.circle,
                                border: Border.all(
                                    color: AppColors.surface, width: 2),
                              ),
                              child: const Icon(
                                Icons.verified,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        AppStrings.get(context, 'elite_member'),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: const Color(0xFF7D6444),
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        fullName,
                        style: AppTextStyles.h1.copyWith(
                          color: AppColors.primary,
                          fontSize: 28,
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

                      // Stats Cards
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppStrings.get(context, 'loyalty_points_label'),
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: AppColors.outline,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text(
                                        loyaltyPoints.toString(),
                                        style: AppTextStyles.h2.copyWith(
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(
                                        Icons.stars,
                                        color: Color(0xFFD4AF37),
                                        size: 20,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppStrings.get(context, 'total_stays_label'),
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: AppColors.outline,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text(
                                        totalStays.toString(),
                                        style: AppTextStyles.h2.copyWith(
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(
                                        Icons.bed_outlined,
                                        color: Color(0xFFD4AF37),
                                        size: 20,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Account Preferences
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          "ACCOUNT PREFERENCES",
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.outline,
                            letterSpacing: 1.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildMenuOption(
                        icon: Icons.edit_outlined,
                        label: AppStrings.get(context, 'edit_profile'),
                        onTap: () async {
                          if (_userData != null) {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => EditProfilePage(
                                  userData: _userData!,
                                ),
                              ),
                            );
                            if (result == true) {
                              setState(() {
                                _isLoading = true;
                              });
                              _fetchUserData();
                            }
                          }
                        },
                      ),
                      _buildMenuOption(
                        icon: Icons.payments_outlined,
                        label: AppStrings.get(context, 'payment_history'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const PaymentHistoryPage(),
                            ),
                          );
                        },
                      ),
                      _buildMenuOption(
                        icon: Icons.history,
                        label: AppStrings.get(context, 'booking_history'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const BookingHistoryPage(),
                            ),
                          );
                        },
                      ),
                      _buildMenuOption(
                        icon: Icons.settings_outlined,
                        label: AppStrings.get(context, 'settings'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const SettingsPage(),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                      _buildMenuOption(
                        icon: Icons.logout,
                        label: AppStrings.get(context, 'logout'),
                        textColor: Colors.red,
                        iconColor: Colors.red,
                        bgColor: Colors.transparent, // or a very light red
                        onTap: () async {
                          await ApiService.clearSession();
                          if (mounted) {
                            Navigator.pushAndRemoveUntil(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => const LoginScreen()),
                              (route) => false,
                            );
                          }
                        },
                      ),
                    ],
                  ),
                ),
        ),
        bottomNavigationBar: const BottomNav(currentIndex: 3),
      ),
    );
  }

  Widget _buildMenuOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color textColor = AppColors.primary,
    Color iconColor = AppColors.primary,
    Color? bgColor,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color:
                    bgColor ?? AppColors.surfaceContainerHigh.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.outlineVariant),
          ],
        ),
      ),
    );
  }
}
