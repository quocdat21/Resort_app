import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/service/pages/service_details_page.dart';

class ServiceListResults extends StatefulWidget {
  final String serviceType;

  const ServiceListResults({super.key, required this.serviceType});

  @override
  State<ServiceListResults> createState() => _ServiceListResultsState();
}

class _ServiceListResultsState extends State<ServiceListResults> {
  final List<Map<String, dynamic>> _results = [
    {
      'id': 1,
      'name': 'Grand Highland Ballroom',
      'description': 'A majestic space for grand weddings and corporate galas with panoramic mountain views.',
      'capacity': 'Up to 500 guests',
      'price': 15000000,
      'rating': 4.9,
      'image': 'assets/images/image_onboarding2.jpg',
      'isLimited': true,
    },
    {
      'id': 2,
      'name': 'Misty Valley Hall',
      'description': 'Intimate conference and meeting space equipped with state-of-the-art audio-visual systems.',
      'capacity': 'Up to 120 guests',
      'price': 8000000,
      'rating': 4.7,
      'image': 'assets/images/image_onboarding2.jpg',
      'isLimited': false,
    },
    {
      'id': 3,
      'name': 'Terrace Event Space',
      'description': 'Open-air venue perfect for cocktail parties and evening socials under the stars.',
      'capacity': 'Up to 250 guests',
      'price': 12000000,
      'rating': 4.8,
      'image': 'assets/images/image_onboarding2.jpg',
      'isLimited': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildFilters(),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(24),
                itemCount: _results.length,
                itemBuilder: (context, index) => _buildServiceCard(_results[index]),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 2),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.surfaceContainerHigh)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.primary),
            onPressed: () => Navigator.pop(context),
          ),
          Expanded(
            child: Text(
              '${widget.serviceType}s',
              textAlign: TextAlign.center,
              style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      child: Row(
        children: [
          _filterChip(Icons.tune, 'FILTER'),
          const SizedBox(width: 12),
          _filterChip(Icons.sort, 'SORT'),
        ],
      ),
    );
  }

  Widget _filterChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: AspectRatio(
                  aspectRatio: 1.2,
                  child: Image.asset(
                    item['image'],
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.orange),
                      const SizedBox(width: 4),
                      Text(
                        item['rating'].toString(),
                        style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              if (item['isLimited'])
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'EXCLUSIVE',
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
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['name'],
                      style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item['capacity'],
                      style: AppTextStyles.labelSmall.copyWith(color: AppColors.secondary, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.favorite_border, size: 20, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            item['description'],
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline, height: 1.4),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Starts from',
                    style: AppTextStyles.bodySmall.copyWith(fontSize: 10, color: AppColors.outline),
                  ),
                  Text(
                    '${NumberFormat('#,###').format(item['price'])} VND',
                    style: AppTextStyles.h3.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ServiceDetailsPage(service: item),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(
                  'BOOK',
                  style: AppTextStyles.labelSmall.copyWith(fontWeight: FontWeight.bold, letterSpacing: 1.1),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
