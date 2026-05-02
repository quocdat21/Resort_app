import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/service/pages/service_details_page.dart';

class ServiceListResults extends StatefulWidget {
  final String serviceType;

  const ServiceListResults({super.key, required this.serviceType});

  @override
  State<ServiceListResults> createState() => _ServiceListResultsState();
}

class _ServiceListResultsState extends State<ServiceListResults> {
  List<dynamic> _services = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchServices();
  }

  Future<void> _fetchServices() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // Mapping serviceType to API params
      String? type;
      String? excludeType;

      if (widget.serviceType == 'Hall') {
        type = 'Hall';
      } else if (widget.serviceType == 'Food') {
        type = 'Food';
      } else if (widget.serviceType == 'Event') {
        type = 'Event';
      } else if (widget.serviceType == 'Other') {
        type = 'Other';
      }

      final response = await ApiService.fetchServices(
        type: type,
        excludeType: excludeType,
      );

      if (response['success'] == true && mounted) {
        setState(() {
          _services = response['data'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = response['message'] ?? 'Failed to load services';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Error connecting to server';
          _isLoading = false;
        });
      }
    }
  }

  double _getLowestPrice(List<dynamic>? prices) {
    if (prices == null || prices.isEmpty) return 0;
    double lowest = double.infinity;
    for (var p in prices) {
      final price = double.tryParse(p['price'].toString()) ?? 0;
      if (price < lowest && price > 0) lowest = price;
    }
    return lowest == double.infinity ? 0 : lowest;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: _isLoading
                  ? const Center(
                      child:
                          CircularProgressIndicator(color: AppColors.primary))
                  : _error != null
                      ? Center(
                          child: Text(_error!, style: AppTextStyles.bodyMedium))
                      : _services.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.search_off,
                                      size: 64,
                                      color:
                                          AppColors.outline.withOpacity(0.5)),
                                  const SizedBox(height: 16),
                                  Text(AppStrings.get(context, 'no_results_found'),
                                      style: AppTextStyles.h3
                                          .copyWith(color: AppColors.outline)),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(24),
                              itemCount: _services.length,
                              itemBuilder: (context, index) =>
                                  _buildServiceCard(_services[index]),
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
      decoration: const BoxDecoration(
        color: AppColors.background,
        border:
            Border(bottom: BorderSide(color: AppColors.surfaceContainerHigh)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.primary),
            onPressed: () => Navigator.pop(context),
          ),
          Expanded(
            child: Text(
              _getLocalizedServiceType(widget.serviceType),
              textAlign: TextAlign.center,
              style: AppTextStyles.h3.copyWith(
                  fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined,
                color: AppColors.primary),
            onPressed: () {},
          ),
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
            style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  String _getLocalizedServiceType(String type) {
    switch (type) {
      case 'Hall':
        return AppStrings.get(context, 'hall');
      case 'Food':
        return AppStrings.get(context, 'food');
      case 'Event':
        return AppStrings.get(context, 'event');
      case 'Other':
        return AppStrings.get(context, 'other');
      default:
        return type;
    }
  }

  Widget _buildServiceCard(Map<String, dynamic> item) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceDetailsPage(service: item),
          ),
        );
      },
      child: Container(
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
                    child: Image.network(
                      ApiService.fixImageUrl(item['image_url']),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.surfaceContainerHigh,
                        child: const Icon(Icons.image_not_supported,
                            color: AppColors.outline),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.orange),
                        const SizedBox(width: 4),
                        Text(
                          '5.0', // Default rating as API doesn't have it yet
                          style: AppTextStyles.bodySmall
                              .copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
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
                        item['name'] ?? 'Service Name',
                        style: AppTextStyles.h3.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary),
                      ),
                      const SizedBox(height: 4),
                      Text(item['capacity'] != null
                          ? 'Sức chứa ${item['capacity']} Khách'
                          : 'Thao Nguyen Resort Services'),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item['description'] ?? 'No description available.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.outline, height: 1.4),
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
                      style: AppTextStyles.bodySmall
                          .copyWith(fontSize: 10, color: AppColors.outline),
                    ),
                    Text(
                      '${NumberFormat('#,###').format(_getLowestPrice(item['prices']))} VND',
                      style: AppTextStyles.h3.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold),
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
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    'BOOK',
                    style: AppTextStyles.labelSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
