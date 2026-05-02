import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/features/home/pages/home_page.dart';
import 'package:resort_app/features/profile/pages/profile_page.dart';
import 'package:resort_app/features/room/pages/rooms_search_results.dart';
import 'package:resort_app/features/service/pages/services_page.dart';

class BottomNav extends StatelessWidget {
  final int currentIndex;

  const BottomNav({
    super.key,
    required this.currentIndex,
  });

  void _onItemTapped(BuildContext context, int index) {
    if (index == currentIndex) return;

    Widget nextScreen;
    switch (index) {
      case 0:
        nextScreen = const HomeScreen();
        break;
      case 1:
        nextScreen = const RoomsSearchResults();
        break;
      case 2:
        nextScreen = const ServicesPage();
        break;
      case 3:
        nextScreen = const ProfilePage();
        break;
      // Add other cases (Booking, Services) later when implemented
      default:
        return; // Temporary, do nothing for unimplemented tabs
    }

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => nextScreen,
        transitionDuration: Duration.zero,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (index) => _onItemTapped(context, index),
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.secondary,
      iconSize: 26,
      selectedLabelStyle: AppTextStyles.bodyMedium.copyWith(
        fontWeight: FontWeight.w700,
      ),
      unselectedLabelStyle: AppTextStyles.bodySmall.copyWith(
        fontWeight: FontWeight.w700,
      ),
      type: BottomNavigationBarType.fixed,
      items: [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home),
          label: AppStrings.get(context, 'home'),
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.calendar_month_outlined),
          activeIcon: const Icon(Icons.calendar_month),
          label: AppStrings.get(context, 'bookings'),
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.spa_outlined),
          activeIcon: const Icon(Icons.spa),
          label: AppStrings.get(context, 'services'),
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline),
          activeIcon: const Icon(Icons.person),
          label: AppStrings.get(context, 'profile'),
        ),
      ],
    );
  }
}
