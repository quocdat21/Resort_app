import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/room/pages/room_edit_booking_page.dart';
import 'package:resort_app/features/room/pages/rooom_add_services_page.dart';

class RoomDetailsPage extends StatefulWidget {
  final Map<String, dynamic> room;
  final Map<String, dynamic>? searchData;

  const RoomDetailsPage({super.key, required this.room, this.searchData});

  @override
  State<RoomDetailsPage> createState() => _RoomDetailsPageState();
}

class _RoomDetailsPageState extends State<RoomDetailsPage> {
  Map<String, dynamic>? _roomDetail;
  bool _isLoading = true;
  int _currentImageIndex = 0;
  bool _showAllAmenities = false;
  Map<String, dynamic>? _localSearchData;

  @override
  void initState() {
    super.initState();
    if (widget.searchData != null) {
      _localSearchData = Map<String, dynamic>.from(widget.searchData!);
    }
    _fetchRoomDetail();
  }

  Future<void> _fetchRoomDetail() async {
    try {
      final roomId = widget.room['id'];
      if (roomId == null) {
        setState(() => _isLoading = false);
        return;
      }
      final result = await ApiService.getRoomDetail(roomId is int ? roomId : int.parse(roomId.toString()));
      if (result['success'] == true) {
        setState(() {
          _roomDetail = result['data'];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error fetching room detail: $e');
      setState(() => _isLoading = false);
    }
  }

  // Helper to get a value from detail data with fallback to passed room data
  dynamic _get(String key) {
    return _roomDetail?[key] ?? widget.room[key];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Scrollable Content
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildImageHeader(),
                _buildMainInfo(),
                _buildAmenities(),
                _buildDescription(),
                _buildStaySummary(),
                const SizedBox(height: 120), // Space for bottom bar
              ],
            ),
          ),

          // Floating Top Icons
          _buildFloatingTopIcons(),

          // Bottom Bar
          _buildBottomActionBar(),
        ],
      ),
    );
  }

  void _openFullScreenImage(List<String> images, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _FullScreenImageViewer(images: images, initialIndex: initialIndex),
      ),
    );
  }

  Widget _buildImageHeader() {
    final String? mainImageUrl = _get('main_image_url');
    final List secondaryImages = _roomDetail?['secondary_images'] ?? [];
    final List<String> allImages = [];
    if (mainImageUrl != null) allImages.add(mainImageUrl);
    for (var img in secondaryImages) {
      if (img['image_url'] != null) allImages.add(img['image_url']);
    }

    return Stack(
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.45,
          width: double.infinity,
          child: allImages.isNotEmpty
              ? PageView.builder(
                  itemCount: allImages.length,
                  onPageChanged: (index) {
                    setState(() => _currentImageIndex = index);
                  },
                  itemBuilder: (context, index) {
                    return GestureDetector(
                      onTap: () => _openFullScreenImage(allImages, index),
                      child: Image.network(
                        allImages[index],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.hotel, size: 64, color: AppColors.outline),
                        ),
                      ),
                    );
                  },
                )
              : Container(
                  color: AppColors.surfaceContainerHigh,
                  child: const Icon(Icons.hotel, size: 64, color: AppColors.outline),
                ),
        ),
        // Pagination dots
        if (allImages.length > 1)
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                  allImages.length,
                  (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentImageIndex == index ? 24 : 8,
                        height: 4,
                        decoration: BoxDecoration(
                          color: _currentImageIndex == index
                              ? Colors.white
                              : Colors.white.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      )),
            ),
          ),
        // Curved overlay at bottom
        Positioned(
          bottom: -1,
          left: 0,
          right: 0,
          child: Container(
            height: 30,
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFloatingTopIcons() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _circularIcon(Icons.arrow_back, () => Navigator.pop(context)),
            _circularIcon(Icons.share_outlined, () {}),
          ],
        ),
      ),
    );
  }

  Widget _circularIcon(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
    );
  }

  Widget _buildMainInfo() {
    final String categoryName = _get('category_name') ?? 'PREMIUM';
    final String zoneName = _get('zone_name') ?? '';
    final String name = _get('name') ?? 'Room';
    final String? avgRating = _get('avg_rating')?.toString();
    final String sizeSqm = _get('size_sqm')?.toString() ?? '';
    final int capacityAdults = _get('capacity_adults') ?? 2;
    final int capacityChildren = _get('capacity_children') ?? 0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${categoryName.toUpperCase()}${zoneName.isNotEmpty ? ' • $zoneName' : ''}',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.secondary,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: Colors.orange),
                  const SizedBox(width: 4),
                  Text(
                    avgRating ?? '—',
                    style: AppTextStyles.bodySmall
                        .copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            name,
            style: AppTextStyles.h1.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 32,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _infoChip(Icons.aspect_ratio, '${sizeSqm}m²'),
              const SizedBox(width: 20),
              Expanded(
                child: _infoChip(Icons.person_outline, '$capacityAdults adults${capacityChildren > 0 ? ', $capacityChildren children' : ''}'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.secondary),
        const SizedBox(width: 6),
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.secondary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildAmenities() {
    // Use amenities from API if available, otherwise show default
    final List amenities = _roomDetail?['amenities'] ?? [];

    if (amenities.isEmpty && _isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
      );
    }

    if (amenities.isEmpty) {
      // Fallback default amenities
      return _buildDefaultAmenities();
    }

    final int displayCount = _showAllAmenities ? amenities.length : (amenities.length > 4 ? 4 : amenities.length);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text(
            'AMENITIES',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.2,
            children: amenities.take(displayCount).map<Widget>((a) {
              final String amenityName = a['name'] ?? '';
              final String? iconUrl = a['icon_url'];

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: iconUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                iconUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.check_circle_outline,
                                  size: 18,
                                  color: AppColors.secondary,
                                ),
                              ),
                            )
                          : const Icon(
                              Icons.check_circle_outline,
                              size: 18,
                              color: AppColors.secondary,
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        amenityName,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          if (amenities.length > 4)
            GestureDetector(
              onTap: () {
                setState(() {
                  _showAllAmenities = !_showAllAmenities;
                });
              },
              child: Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  _showAllAmenities ? 'Show less ∧' : 'More amenities ∨',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDefaultAmenities() {
    final amenities = [
      {'icon': Icons.wifi, 'label': 'High Speed\nWi-Fi'},
      {'icon': Icons.ac_unit, 'label': 'Climate\nControl'},
      {'icon': Icons.local_cafe_outlined, 'label': 'Espresso Bar'},
      {'icon': Icons.hot_tub, 'label': 'Infinity Bath'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text(
            'AMENITIES',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.2,
            children: amenities
                .map((a) => Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.secondary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(a['icon'] as IconData,
                                size: 18, color: AppColors.secondary),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              a['label'] as String,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                height: 1.2,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    final String description = _get('description') ?? '';

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'THE SANCTUARY EXPERIENCE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description.isEmpty ? 'Không có mô tả.' : description,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.onSurfaceVariant,
              height: 1.6,
            ),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Read more ˇ',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.secondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStaySummary() {
    final search = _localSearchData ?? {};
    final String? checkInStr = search['checkIn'];
    final String? checkOutStr = search['checkOut'];
    
    int nights = 0;
    bool hasDates = false;

    if (checkInStr != null && checkOutStr != null) {
      try {
        final checkInDate = DateFormat('yyyy-MM-dd').parse(checkInStr);
        final checkOutDate = DateFormat('yyyy-MM-dd').parse(checkOutStr);
        nights = checkOutDate.difference(checkInDate).inDays;
        if (nights > 0) hasDates = true;
      } catch (e) {
        debugPrint('Error parsing dates: $e');
      }
    }

    final int basePrice = (_get('base_price') is int)
        ? _get('base_price')
        : int.tryParse(_get('base_price')?.toString() ?? '0') ?? 0;
    final int nightlyRate = basePrice;
    int subtotal = nightlyRate * nights;

    int extraFeePerNight = 0;
    int under6Count = 0;
    final List<dynamic> childAges = search['childAges'] ?? [];
    for (var ageStr in childAges) {
      if (ageStr == '< 6 years old') {
        under6Count++;
        if (under6Count > 2) extraFeePerNight += 200000;
      } else if (ageStr == '6 - 12 years old') {
        extraFeePerNight += 200000;
      } else if (ageStr == '> 12 years old') {
        extraFeePerNight += 400000;
      }
    }
    
    int totalExtraFee = extraFeePerNight * (nights > 0 ? nights : 1);
    if (hasDates) {
      subtotal += totalExtraFee;
    }

    final int tax = (subtotal * 0.1).round();
    final int total = subtotal + tax;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'STAY SUMMARY',
                style: AppTextStyles.labelSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                  color: AppColors.primary.withOpacity(0.7),
                ),
              ),
              InkWell(
                onTap: () async {
                  final combinedData = {
                    ...(_localSearchData ?? {}),
                    ...(_roomDetail ?? widget.room),
                  };
                  final updatedSearchData = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          EditBookingPage(bookingData: combinedData),
                    ),
                  );
                  if (updatedSearchData != null && updatedSearchData is Map<String, dynamic>) {
                    setState(() {
                      _localSearchData = updatedSearchData;
                    });
                  }
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: AppColors.secondary.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Text(
                        'EDIT',
                        style: AppTextStyles.labelSmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.secondary,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.calendar_today_outlined,
                          size: 14, color: AppColors.secondary),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (hasDates) ...[
            _summaryRow('Room Charge (${nights} nights)', '${NumberFormat('#,###').format(nightlyRate * nights)} VND'),
            if (totalExtraFee > 0) ...[
              const SizedBox(height: 12),
              _summaryRow('Children Extra Fee', '${NumberFormat('#,###').format(totalExtraFee)} VND'),
            ],
            const SizedBox(height: 12),
            _summaryRow('Service Fee & Taxes (10%)', '${NumberFormat('#,###').format(tax)} VND'),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: AppTextStyles.h3.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  '${NumberFormat('#,###').format(total)} VND',
                  style: AppTextStyles.h2.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ],
            ),
          ] else ...[
            _summaryRow('Nights', '-'),
            const SizedBox(height: 12),
            _summaryRow('Service Fee & Taxes', '-'),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: AppTextStyles.h3.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Flexible(
                  child: Text(
                    'Vui lòng chọn ngày ở',
                    style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.error),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.bodySmall
              .copyWith(color: AppColors.outline, fontWeight: FontWeight.w500),
        ),
        Text(
          value,
          style: AppTextStyles.bodySmall
              .copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildBottomActionBar() {
    final int basePrice = (_get('base_price') is int)
        ? _get('base_price')
        : int.tryParse(_get('base_price')?.toString() ?? '0') ?? 0;

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
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'From',
                    style: AppTextStyles.labelSmall
                        .copyWith(fontSize: 10, color: AppColors.outline),
                  ),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '${NumberFormat('#,###').format(basePrice)} VND\n',
                          style: AppTextStyles.h2.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                        ),
                        TextSpan(
                          text: '/ NIGHT',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.outline,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            SizedBox(
              height: 56,
              width: 160,
              child: ElevatedButton(
                onPressed: () {
                  final search = _localSearchData ?? {};
                  final String? checkInStr = search['checkIn'];
                  final String? checkOutStr = search['checkOut'];
                  if (checkInStr == null || checkOutStr == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Vui lòng chọn ngày Check-in, Check-out để tiếp tục!',
                          style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
                        ),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }

                  final combinedData = {
                    ...(_localSearchData ?? {}),
                    ...(_roomDetail ?? widget.room),
                  };

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          SelectServicesPage(bookingData: combinedData),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                  elevation: 8,
                  shadowColor: AppColors.primary.withOpacity(0.3),
                ),
                child: Text(
                  'Continue',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const _FullScreenImageViewer({required this.images, required this.initialIndex});

  @override
  State<_FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<_FullScreenImageViewer> {
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
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
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
              // Standard swipeable image without InteractiveViewer blocks to avoid 
              // gesture conflicts. Allows smooth horizontal swiping.
              return Center(
                child: InteractiveViewer(
                  minScale: 1.0,
                  maxScale: 3.0,
                  child: Image.network(
                    widget.images[index],
                    fit: BoxFit.contain,
                  ),
                ),
              );
            },
          ),
          if (widget.images.length > 1)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  widget.images.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentIndex == index ? 24 : 8,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _currentIndex == index
                          ? Colors.white
                          : Colors.white.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
