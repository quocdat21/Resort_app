import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/features/home/pages/home_page.dart';
import 'package:resort_app/features/profile/pages/profile_page.dart';

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
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: "Home",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_month_outlined),
          activeIcon: Icon(Icons.calendar_month),
          label: "Booking",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.spa_outlined),
          activeIcon: Icon(Icons.spa),
          label: "Services",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
          label: "Profile",
        ),
      ],
    );
  }
}
