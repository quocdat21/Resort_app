import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/service/pages/service_booking_summary_page.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ServiceDetailsPage extends StatefulWidget {
  final Map<String, dynamic> service;

  const ServiceDetailsPage({super.key, required this.service});

  @override
  State<ServiceDetailsPage> createState() => _ServiceDetailsPageState();
}

class _ServiceDetailsPageState extends State<ServiceDetailsPage> {
  int _selectedPackageIndex = 0;
  DateTime _selectedDate = DateTime.now();
  List<DateTime> _weekDates = [];

  @override
  void initState() {
    super.initState();

    final now = DateTime.now();
    DateTime initialDate = now;
    if (now.hour >= 14) {
      initialDate =
          DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    }

    _selectedDate = initialDate;
    _generateWeekDates(initialDate);
  }

  void _generateWeekDates(DateTime baseDate) {
    setState(() {
      _weekDates =
          List.generate(14, (index) => baseDate.add(Duration(days: index)));
    });
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final formatter = NumberFormat('#,###', 'vi_VN');
    return formatter.format(double.tryParse(price.toString()) ?? 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              children: [
                _buildHeroSection(),
                _buildDetailsContent(),
                const SizedBox(height: 120),
              ],
            ),
          ),
          _buildTopNavigationBar(),
          _buildBottomActionBar(),
        ],
      ),
    );
  }

  Widget _buildTopNavigationBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            Text(
              'Thao Nguyen Resort',
              style: AppTextStyles.bodyLarge
                  .copyWith(fontWeight: FontWeight.bold, color: Colors.white),
            ),
            IconButton(
              icon: const Icon(Icons.notifications_none_outlined,
                  color: Colors.white),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      height: 450,
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: CachedNetworkImageProvider(
              ApiService.fixImageUrl(widget.service['image_url']),
              headers: ApiService.imageHeaders),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.4),
                  Colors.transparent,
                  Colors.black.withOpacity(0.8),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCC19F).withOpacity(0.8),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    widget.service['type'] == 'Hall'
                        ? AppStrings.get(context, 'grand_venue')
                        : AppStrings.get(context, 'premium_service'),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  widget.service['name'] ?? 'Service Detail',
                  style: AppTextStyles.h1.copyWith(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.access_time,
                        size: 16, color: Colors.white70),
                    const SizedBox(width: 6),
                    Text(
                      widget.service['type'] == 'Hall'
                          ? AppStrings.get(context, 'daily_hourly')
                          : AppStrings.get(context, 'flexible_timing'),
                      style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white70, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 12),
                    const Icon(Icons.people_outline,
                        size: 16, color: Colors.white70),
                    const SizedBox(width: 4),
                    Text(
                      widget.service['capacity'] != null
                          ? '${widget.service['capacity']} ${AppStrings.get(context, 'guests_label')}'
                          : AppStrings.get(context, 'unlimited'),
                      style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white70, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
          // Curved overlay at bottom
          Positioned(
            bottom: -1,
            left: 0,
            right: 0,
            child: Container(
              height: 32,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsContent() {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          Text(
            AppStrings.get(context, 'about_service'),
            style: AppTextStyles.h3.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text(
            widget.service['description'] ??
                AppStrings.get(context, 'no_description'),
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.outline, height: 1.6),
          ),
          const SizedBox(height: 24),
          _buildWeekDatePicker(),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppStrings.get(context, 'service_packages'),
                style: AppTextStyles.h3.copyWith(
                    fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (widget.service['prices'] != null &&
              (widget.service['prices'] as List).isNotEmpty)
            ...(widget.service['prices'] as List).asMap().entries.map((entry) {
              final idx = entry.key;
              final price = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildPackageCard(
                  idx,
                  widget.service['type'] == 'Hall'
                      ? (price['price_type'] == 'full_day'
                          ? AppStrings.get(context, 'full_day_pkg')
                          : price['price_type'] == 'half_day'
                              ? AppStrings.get(context, 'half_day_pkg')
                              : AppStrings.get(context, 'standard_unit'))
                      : AppStrings.get(context, 'service_packages'),
                  '${_formatPrice(price['price'])} VND',
                  widget.service['type'] == 'Hall'
                      ? (price['unit'] != null
                          ? '${AppStrings.get(context, 'per')} ${price['unit']}'
                          : 'Standard rate')
                      : '',
                  [
                    price['description'] ??
                        'Exclusive service at Thao Nguyen Resort'
                  ],
                  isMostLoved: widget.service['type'] == 'Hall' && idx == 0,
                ),
              );
            })
          else
            Center(
              child: Text(AppStrings.get(context, 'no_description'),
                  style: AppTextStyles.bodySmall),
            ),
          const SizedBox(height: 40),
          Text(
            AppStrings.get(context, 'atmosphere'),
            style: AppTextStyles.h3.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
          const SizedBox(height: 20),
          _buildAtmosphereGallery(),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(height: 12),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(
    int index,
    String title,
    String price,
    String subtitle,
    List<String> features, {
    bool isMostLoved = false,
  }) {
    final bool isSelected = _selectedPackageIndex == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedPackageIndex = index),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFFFF8F0)
              : AppColors.surfaceContainerHigh.withOpacity(0.2),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? const Color(0xFFDCC19F) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (title.isNotEmpty)
                        Text(
                          title,
                          style: AppTextStyles.h3.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary),
                        ),
                      if (subtitle.isNotEmpty)
                        Text(
                          subtitle,
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.outline),
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      price,
                      style: AppTextStyles.h2.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary),
                    ),
                    if (isMostLoved)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          AppStrings.get(context, 'popular'),
                          style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            ...features.map((feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          size: 16, color: Color(0xFF8B7355)),
                      const SizedBox(width: 8),
                      Text(
                        feature,
                        style: AppTextStyles.bodySmall.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  void _openFullScreenGallery(List<String> images, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FullScreenImageViewer(
          images: images,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  Widget _buildAtmosphereGallery() {
    final String mainImageUrl =
        ApiService.fixImageUrl(widget.service['image_url']);
    final List<dynamic> secondaryImagesData =
        widget.service['secondary_images'] ?? [];

    final List<String> allImages = [mainImageUrl];
    for (var img in secondaryImagesData) {
      if (img['image_url'] != null) {
        allImages.add(ApiService.fixImageUrl(img['image_url']));
      }
    }

    if (allImages.isEmpty) {
      return Container(
        height: 150,
        width: double.infinity,
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withOpacity(0.3),
          borderRadius: BorderRadius.circular(24),
        ),
        child: const Center(
          child: Icon(Icons.photo_library_outlined,
              color: AppColors.outline, size: 48),
        ),
      );
    }

    return Row(
      children: [
        // Main/Primary Image in Gallery
        Expanded(
          flex: 2,
          child: GestureDetector(
            onTap: () => _openFullScreenGallery(allImages, 0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: CachedNetworkImage(
                imageUrl: allImages[0],
                height: 220,
                fit: BoxFit.cover,
                httpHeaders: ApiService.imageHeaders,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                errorWidget: (context, url, error) => Container(
                  color: AppColors.surfaceContainerHigh,
                  child: const Icon(Icons.image, color: AppColors.outline),
                ),
              ),
            ),
          ),
        ),
        if (allImages.length > 1) ...[
          const SizedBox(width: 12),
          Expanded(
            flex: 1,
            child: Column(
              children: [
                // Second Image
                GestureDetector(
                  onTap: () => _openFullScreenGallery(allImages, 1),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: CachedNetworkImage(
                      imageUrl: allImages[1],
                      height: 104,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      httpHeaders: ApiService.imageHeaders,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      errorWidget: (context, url, error) =>
                          Container(color: AppColors.surfaceContainerHigh),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Third Image or More indicator
                GestureDetector(
                  onTap: () => _openFullScreenGallery(
                      allImages, allImages.length > 2 ? 2 : 1),
                  child: Container(
                    height: 104,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerHigh.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: allImages.length > 2
                        ? Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: CachedNetworkImage(
                                  imageUrl: allImages[2],
                                  height: 104,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  httpHeaders: ApiService.imageHeaders,
                                  placeholder: (context, url) => const Center(
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  ),
                                  errorWidget: (context, url, error) =>
                                      Container(
                                          color:
                                              AppColors.surfaceContainerHigh),
                                ),
                              ),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.4),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Center(
                                  child: Text(
                                    allImages.length > 3
                                        ? '+${allImages.length - 2}'
                                        : '...',
                                    style: AppTextStyles.h3.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : const Center(
                            child: Icon(Icons.add_photo_alternate_outlined,
                                color: AppColors.outline),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildBottomActionBar() {
    final prices = widget.service['prices'] as List?;
    final selectedPrice = (prices != null &&
            prices.isNotEmpty &&
            _selectedPackageIndex < prices.length)
        ? prices[_selectedPackageIndex]['price']
        : 0;

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        decoration: BoxDecoration(
          color: AppColors.background,
          border:
              Border(top: BorderSide(color: AppColors.surfaceContainerHigh)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.get(context, 'total_estimate'),
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9,
                        color: AppColors.outline,
                        fontWeight: FontWeight.bold)),
                Text(
                  '${_formatPrice(selectedPrice)} VND',
                  style: AppTextStyles.h3.copyWith(
                      color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(
              height: 56,
              width: 180,
              child: ElevatedButton(
                onPressed: () {
                  final prices = widget.service['prices'] as List?;
                  if (prices == null || prices.isEmpty) return;

                  final selectedPackage = prices[_selectedPackageIndex];

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ServiceBookingSummaryPage(
                        bookingData: {
                          'service': widget.service,
                          'package': selectedPackage,
                          'totalPrice': selectedPackage['price'],
                          'date': _selectedDate,
                          'guests': 1, // Default to 1
                        },
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28)),
                  elevation: 8,
                ),
                child: Text(
                  AppStrings.get(context, 'book_service'),
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeekDatePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppStrings.get(context, 'choose_date'),
              style: AppTextStyles.h3.copyWith(
                  fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            GestureDetector(
              onTap: () => _selectDateFromCalendar(context),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Text(
                      DateFormat.yMMMM(Localizations.localeOf(context).languageCode).format(_selectedDate),
                      style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.secondary,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.calendar_month,
                        size: 16, color: AppColors.secondary),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 85,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _weekDates.length,
            padding: EdgeInsets.zero,
            itemBuilder: (context, index) {
              final date = _weekDates[index];
              final isSelected = DateFormat('yyyy-MM-dd').format(date) ==
                  DateFormat('yyyy-MM-dd').format(_selectedDate);

              return GestureDetector(
                onTap: () => setState(() => _selectedDate = date),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 65,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.surfaceContainerHigh.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color:
                          isSelected ? AppColors.primary : Colors.transparent,
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        DateFormat.E(Localizations.localeOf(context).languageCode).format(date).toUpperCase(),
                        style: TextStyle(
                          color:
                              isSelected ? Colors.white70 : AppColors.outline,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        DateFormat('dd').format(date),
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.primary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Future<void> _selectDateFromCalendar(BuildContext context) async {
    final now = DateTime.now();
    DateTime firstSelectableDay = DateTime(now.year, now.month, now.day);
    if (now.hour >= 14) {
      firstSelectableDay = firstSelectableDay.add(const Duration(days: 1));
    }

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate.isBefore(firstSelectableDay)
          ? firstSelectableDay
          : _selectedDate,
      firstDate: firstSelectableDay,
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.primary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _generateWeekDates(picked);
    }
  }
}

class FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const FullScreenImageViewer({
    super.key,
    required this.images,
    required this.initialIndex,
  });

  @override
  State<FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<FullScreenImageViewer> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white, size: 28),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          PageView.builder(
            itemCount: widget.images.length,
            controller: PageController(initialPage: widget.initialIndex),
            onPageChanged: (index) {
              setState(() => _currentIndex = index);
            },
            itemBuilder: (context, index) {
              return Center(
                child: InteractiveViewer(
                  minScale: 1.0,
                  maxScale: 4.0,
                  child: CachedNetworkImage(
                    imageUrl: widget.images[index],
                    fit: BoxFit.contain,
                    width: double.infinity,
                    httpHeaders: ApiService.imageHeaders,
                    placeholder: (context, url) => const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    errorWidget: (context, url, error) => const Center(
                      child: Icon(Icons.broken_image,
                          color: Colors.white54, size: 64),
                    ),
                  ),
                ),
              );
            },
          ),
          if (widget.images.length > 1)
            Positioned(
              bottom: 60,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  widget.images.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentIndex == index ? 24 : 8,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _currentIndex == index
                          ? Colors.white
                          : Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
            ),
          // Counter indicator
          Positioned(
            top: MediaQuery.of(context).padding.top + 15,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${_currentIndex + 1} / ${widget.images.length}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
