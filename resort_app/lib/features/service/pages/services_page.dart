import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/service/pages/service_list_results.dart';

class ServicesPage extends StatelessWidget {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
          'Thao Nguyen Resort',
          style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildFeaturedHero(context),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.get(context, 'resort_services'),
                    style: AppTextStyles.h2.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.get(context, 'nourish_soul'),
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.outline),
                  ),
                  const SizedBox(height: 24),
                  _buildServiceGrid(context),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 2),
    );
  }

  Widget _buildFeaturedHero(BuildContext context) {
    return Container(
      height: 220,
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: const DecorationImage(
          image: AssetImage('assets/images/image_onboarding2.jpg'), // Using available asset
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppStrings.get(context, 'exclusives'),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: Colors.white70,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  AppStrings.get(context, 'curated_experiences'),
                  style: AppTextStyles.h2.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceGrid(BuildContext context) {
    final services = [
      {
        'title': AppStrings.get(context, 'hall'),
        'apiKey': 'Hall',
        'desc': AppStrings.get(context, 'hall_desc'),
        'capacity': AppStrings.get(context, 'hall_cap'),
        'icon': Icons.business_outlined,
        'color': const Color(0xFFE8F5E9),
        'iconColor': const Color(0xFF2E7D32),
      },
      {
        'title': AppStrings.get(context, 'food'),
        'apiKey': 'Food',
        'desc': AppStrings.get(context, 'food_desc'),
        'capacity': AppStrings.get(context, 'food_cap'),
        'icon': Icons.restaurant_outlined,
        'color': const Color(0xFFFFF3E0),
        'iconColor': const Color(0xFFEF6C00),
      },
      {
        'title': AppStrings.get(context, 'event'),
        'apiKey': 'Event',
        'desc': AppStrings.get(context, 'event_desc'),
        'capacity': AppStrings.get(context, 'event_cap'),
        'icon': Icons.celebration_outlined,
        'color': const Color(0xFFE3F2FD),
        'iconColor': const Color(0xFF1565C0),
      },
      {
        'title': AppStrings.get(context, 'other'),
        'apiKey': 'Other',
        'desc': AppStrings.get(context, 'other_services_desc'),
        'capacity': AppStrings.get(context, 'other_cap'),
        'icon': Icons.explore_outlined,
        'color': const Color(0xFFF3E5F5),
        'iconColor': const Color(0xFF7B1FA2),
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.85,
      ),
      itemCount: services.length,
      itemBuilder: (context, index) {
        final service = services[index];
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ServiceListResults(serviceType: service['apiKey'] as String),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: (service['color'] as Color).withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    service['icon'] as IconData,
                    color: service['iconColor'] as Color,
                    size: 22,
                  ),
                ),
                const Spacer(),
                Text(
                  service['title'] as String,
                  style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                const SizedBox(height: 4),
                Text(
                  service['capacity'] as String,
                  style: AppTextStyles.labelSmall.copyWith(color: AppColors.secondary, fontSize: 10, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  service['desc'] as String,
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline, height: 1.3),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
