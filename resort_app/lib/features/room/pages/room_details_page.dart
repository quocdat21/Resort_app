import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/room/pages/room_edit_booking_page.dart';
import 'package:resort_app/features/room/pages/room_add_services_page.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:resort_app/core/widgets/loading.dart';

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
  bool _showRoomNumbers = false;
  Map<String, dynamic>? _localSearchData;
  final List<int> _selectedRoomNumberIds = [];

  int _adults = 1;
  int _children = 0;
  List<String> _childAges = [];

  @override
  void initState() {
    super.initState();
    if (widget.searchData != null) {
      _localSearchData = Map<String, dynamic>.from(widget.searchData!);
      _adults = _localSearchData?['adults'] ?? 1;
      _children = _localSearchData?['children'] ?? 0;
      _childAges = List<String>.from(_localSearchData?['childAges'] ?? []);
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
      final result = await ApiService.getRoomDetail(
        roomId is int ? roomId : int.parse(roomId.toString()),
        checkIn: _localSearchData?['checkIn'],
        checkOut: _localSearchData?['checkOut'],
      );
      if (result['success'] == true) {
        setState(() {
          _roomDetail = result['data'];
          _isLoading = false;

          // Auto-select first available room number if none selected yet and we have search data
          if (_selectedRoomNumberIds.isEmpty && widget.searchData != null) {
            final List<dynamic> rns = _roomDetail?['room_numbers'] ?? [];
            for (var rn in rns) {
              final String status = rn['status'] ?? 'Available';
              if (status == 'Available') {
                final int rnId = rn['id'] is int
                    ? rn['id']
                    : int.tryParse(rn['id'].toString()) ?? 0;
                if (rnId != 0) {
                  _selectedRoomNumberIds.add(rnId);
                  break; // Select one by default
                }
              }
            }
          }
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
                _buildGuestSelection(),
                _buildDescription(),
                _buildRoomNumberSelection(),
                _buildStaySummary(),
                const SizedBox(height: 120), // Space for bottom bar
              ],
            ),
          ),

          // Floating Top Icons
          _buildFloatingTopIcons(),

          // Bottom Bar
          _buildBottomActionBar(),
          if (_isLoading) const Loading(),
        ],
      ),
    );
  }

  void _openFullScreenImage(List<String> images, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            _FullScreenImageViewer(images: images, initialIndex: initialIndex),
      ),
    );
  }

  Widget _buildImageHeader() {
    final String? mainImageUrl = _get('main_image_url');
    final List secondaryImages = _roomDetail?['secondary_images'] ?? [];
    final List<String> allImages = [];
    if (mainImageUrl != null)
      allImages.add(ApiService.fixImageUrl(mainImageUrl));
    for (var img in secondaryImages) {
      if (img['image_url'] != null)
        allImages.add(ApiService.fixImageUrl(img['image_url']));
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
                      child: CachedNetworkImage(
                        imageUrl: allImages[index],
                        fit: BoxFit.cover,
                        httpHeaders: ApiService.imageHeaders,
                        placeholder: (context, url) => const Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.hotel,
                              size: 64, color: AppColors.outline),
                        ),
                      ),
                    );
                  },
                )
              : Container(
                  color: AppColors.surfaceContainerHigh,
                  child: const Icon(Icons.hotel,
                      size: 64, color: AppColors.outline),
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
                child: _infoChip(Icons.person_outline,
                    '$capacityAdults ${AppStrings.get(context, 'adults').toLowerCase()}${capacityChildren > 0 ? ', $capacityChildren ${AppStrings.get(context, 'children').toLowerCase()}' : ''}'),
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
        child: Center(
            child: CircularProgressIndicator(
                strokeWidth: 2, color: AppColors.primary)),
      );
    }

    if (amenities.isEmpty) {
      // Fallback default amenities
      return _buildDefaultAmenities();
    }

    final int displayCount = _showAllAmenities
        ? amenities.length
        : (amenities.length > 4 ? 4 : amenities.length);

    return Padding(
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text(
            AppStrings.get(context, 'amenities'),
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          GridView.count(
            padding: EdgeInsets.zero,
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
                              child: CachedNetworkImage(
                                imageUrl: ApiService.fixImageUrl(iconUrl),
                                fit: BoxFit.cover,
                                httpHeaders: ApiService.imageHeaders,
                                placeholder: (context, url) => const Center(
                                  child:
                                      CircularProgressIndicator(strokeWidth: 1),
                                ),
                                errorWidget: (context, url, error) => const Icon(
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
                padding: const EdgeInsets.only(top: 20),
                child: Text(
                  _showAllAmenities
                      ? AppStrings.get(context, 'show_less')
                      : AppStrings.get(context, 'more_amenities'),
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
            AppStrings.get(context, 'amenities'),
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
            AppStrings.get(context, 'the_sanctuary_experience'),
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description.isEmpty
                ? AppStrings.get(context, 'no_description')
                : description,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.onSurfaceVariant,
              height: 1.6,
            ),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              AppStrings.get(context, 'read_more'),
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

  Widget _buildRoomNumberSelection() {
    final List<dynamic> roomNumbers = _roomDetail?['room_numbers'] ?? [];

    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Center(
            child: CircularProgressIndicator(
                strokeWidth: 2, color: AppColors.primary)),
      );
    }

    final int displayCount = _showRoomNumbers
        ? roomNumbers.length
        : (roomNumbers.length > 12 ? 12 : roomNumbers.length);

    if (roomNumbers.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Text(
              'AVAILABLE ROOMS',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.primary,
                letterSpacing: 1.1,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHigh.withOpacity(0.3),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                AppStrings.get(context, 'no_rooms_available'),
                style:
                    AppTextStyles.bodySmall.copyWith(color: AppColors.outline),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppStrings.get(context, 'available_rooms'),
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.primary,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${_selectedRoomNumberIds.length} ${AppStrings.get(context, 'selected')}',
                style: AppTextStyles.bodySmall.copyWith(
                  color: _selectedRoomNumberIds.isEmpty
                      ? AppColors.outline
                      : AppColors.secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            AppStrings.get(context, 'choose_room_instruction'),
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline),
          ),
          const SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: roomNumbers.take(displayCount).map<Widget>((rn) {
                    final int rnId = rn['id'] is int
                        ? rn['id']
                        : int.tryParse(rn['id'].toString()) ?? 0;
                    final String roomNum = rn['room_number'] ?? '';
                    final String status = rn['status'] ?? 'Available';
                    // Room is unavailable if it's Occupied, Booked, or under Maintenance
                    final bool isUnavailable =
                        status != 'Available' && status != 'available';
                    final bool isSelected =
                        _selectedRoomNumberIds.contains(rnId);

                    return GestureDetector(
                      onTap: isUnavailable
                          ? null
                          : () {
                              setState(() {
                                if (isSelected) {
                                  _selectedRoomNumberIds.remove(rnId);
                                } else {
                                  if (_selectedRoomNumberIds.length >= 2) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(AppStrings.get(
                                            context, 'max_rooms_error')),
                                        backgroundColor: AppColors.error,
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );
                                    return;
                                  }
                                  _selectedRoomNumberIds.add(rnId);
                                }

                                // Handle guest reset/re-limit based on room count
                                int roomCount = _selectedRoomNumberIds.length;

                                if (roomCount == 0) {
                                  // Reset to default search data if no rooms selected
                                  _adults = _localSearchData?['adults'] ?? 1;
                                  _children =
                                      _localSearchData?['children'] ?? 0;
                                  _childAges = List<String>.from(
                                      _localSearchData?['childAges'] ?? []);
                                } else {
                                  // Ensure current guests don't exceed new capacity
                                  final int maxAdults =
                                      (_get('capacity_adults') ?? 4) *
                                          roomCount;
                                  final int maxChildren =
                                      (_get('capacity_children') ?? 4) *
                                          roomCount;

                                  if (_adults > maxAdults) _adults = maxAdults;
                                  if (_children > maxChildren) {
                                    _children = maxChildren;
                                    if (_childAges.length > _children) {
                                      _childAges =
                                          _childAges.sublist(0, _children);
                                    }
                                  }
                                }
                              });
                            },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 14),
                        decoration: BoxDecoration(
                          color: isUnavailable
                              ? AppColors.error.withOpacity(0.08)
                              : (isSelected ? AppColors.primary : Colors.white),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isUnavailable
                                ? AppColors.error.withOpacity(0.2)
                                : (isSelected
                                    ? AppColors.primary
                                    : AppColors.surfaceContainerHigh),
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected && !isUnavailable
                              ? [
                                  BoxShadow(
                                    color: AppColors.primary.withOpacity(0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ]
                              : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isUnavailable
                                  ? Icons.lock_outline
                                  : (isSelected
                                      ? Icons.check_circle
                                      : Icons.door_front_door_outlined),
                              size: 18,
                              color: isUnavailable
                                  ? AppColors.error
                                  : (isSelected
                                      ? Colors.white
                                      : AppColors.primary),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'R$roomNum',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                color: isUnavailable
                                    ? AppColors.error
                                    : (isSelected
                                        ? Colors.white
                                        : AppColors.primary),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                if (roomNumbers.length > 12)
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _showRoomNumbers = !_showRoomNumbers;
                      });
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20),
                      child: Text(
                        _showRoomNumbers
                            ? AppStrings.get(context, 'show_less')
                            : AppStrings.get(context, 'more_room_numbers'),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.secondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
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
    final int roomCount =
        _selectedRoomNumberIds.isEmpty ? 1 : _selectedRoomNumberIds.length;
    int subtotal = nightlyRate * nights * roomCount;

    final List<dynamic> roomNumbersData =
        _roomDetail?['room_numbers'] ?? widget.room['room_numbers'] ?? [];
    final List<String> selectedRoomNumberStrings = roomNumbersData
        .where((rn) {
          final int id = rn['id'] is int
              ? rn['id']
              : int.tryParse(rn['id'].toString()) ?? 0;
          return _selectedRoomNumberIds.contains(id);
        })
        .map((rn) => rn['room_number']?.toString() ?? '')
        .toList();

    int extraFeePerNight = 0;
    int under6Count = 0;
    // Base rule: 2 children under 6 are free per room booked
    int freeUnder6Limit = _selectedRoomNumberIds.length > 0
        ? _selectedRoomNumberIds.length * 2
        : 2;

    final String ageLess6 = AppStrings.get(context, 'age_less_6');
    final String age6to12 = AppStrings.get(context, 'age_6_12');
    final String ageMore12 = AppStrings.get(context, 'age_more_12');

    for (var ageStr in _childAges) {
      if (ageStr == ageLess6) {
        under6Count++;
        if (under6Count > freeUnder6Limit) {
          extraFeePerNight += 200000;
        }
      } else if (ageStr == age6to12) {
        extraFeePerNight += 200000;
      } else if (ageStr == ageMore12) {
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
                AppStrings.get(context, 'stay_summary'),
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
                    'adults': _adults,
                    'children': _children,
                    'childAges': _childAges,
                  };
                  final updatedSearchData = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          EditBookingPage(bookingData: combinedData),
                    ),
                  );
                  if (updatedSearchData != null &&
                      updatedSearchData is Map<String, dynamic>) {
                    setState(() {
                      _localSearchData = updatedSearchData;
                      // Update local guest state if changed in edit page (though we want to keep it here mostly)
                      if (updatedSearchData.containsKey('adults'))
                        _adults = updatedSearchData['adults'];
                      if (updatedSearchData.containsKey('children'))
                        _children = updatedSearchData['children'];
                      if (updatedSearchData.containsKey('childAges'))
                        _childAges =
                            List<String>.from(updatedSearchData['childAges']);
                    });
                    _fetchRoomDetail();
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
                        AppStrings.get(context, 'edit'),
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
          if (hasDates && _selectedRoomNumberIds.isNotEmpty) ...[
            _summaryRow(AppStrings.get(context, 'check_in'), checkInStr!),
            const SizedBox(height: 12),
            _summaryRow(AppStrings.get(context, 'check_out'), checkOutStr!),
            const SizedBox(height: 12),
            _summaryRow(
                '${AppStrings.get(context, 'room_charge')} ($roomCount ${AppStrings.get(context, 'rooms').toLowerCase()} × $nights ${AppStrings.get(context, 'night').toLowerCase()})',
                '${NumberFormat('#,###').format(nightlyRate * nights * roomCount)} VND'),
            if (selectedRoomNumberStrings.isNotEmpty) ...[
              const SizedBox(height: 12),
              _summaryRow(AppStrings.get(context, 'room_numbers'),
                  selectedRoomNumberStrings.join(', ')),
            ],
            if (totalExtraFee > 0) ...[
              const SizedBox(height: 12),
              _summaryRow(AppStrings.get(context, 'children_extra_fee'),
                  '${NumberFormat('#,###').format(totalExtraFee)} VND'),
            ],
            const SizedBox(height: 12),
            _summaryRow(AppStrings.get(context, 'service_fee_taxes'),
                '${NumberFormat('#,###').format(tax)} VND'),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppStrings.get(context, 'total'),
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
            if (hasDates) ...[
              _summaryRow(AppStrings.get(context, 'check_in'), checkInStr!),
              const SizedBox(height: 12),
              _summaryRow(AppStrings.get(context, 'check_out'), checkOutStr!),
              const SizedBox(height: 12),
              _summaryRow(AppStrings.get(context, 'nights'), '$nights'),
            ] else ...[
              _summaryRow(AppStrings.get(context, 'nights'), '-'),
            ],
            const SizedBox(height: 12),
            _summaryRow(
                AppStrings.get(context, 'rooms'),
                _selectedRoomNumberIds.isEmpty
                    ? AppStrings.get(context, 'select_room_instruction')
                    : '${_selectedRoomNumberIds.length} ${AppStrings.get(context, 'rooms').toLowerCase()}'),
            const SizedBox(height: 12),
            _summaryRow(AppStrings.get(context, 'service_fee_taxes'), '-'),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppStrings.get(context, 'total'),
                  style: AppTextStyles.h3.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Flexible(
                  child: Text(
                    !hasDates && _selectedRoomNumberIds.isEmpty
                        ? AppStrings.get(
                            context, 'select_date_room_instruction')
                        : !hasDates
                            ? AppStrings.get(context, 'select_date_instruction')
                            : AppStrings.get(
                                context, 'select_room_instruction'),
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
        decoration: const BoxDecoration(
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
                    AppStrings.get(context, 'from'),
                    style: AppTextStyles.labelSmall
                        .copyWith(fontSize: 10, color: AppColors.outline),
                  ),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text:
                              '${NumberFormat('#,###').format(basePrice)} VND\n',
                          style: AppTextStyles.h2.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                        ),
                        TextSpan(
                          text:
                              ' / ${AppStrings.get(context, 'night').toUpperCase()}',
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
                          AppStrings.get(context, 'select_date_instruction'),
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: Colors.white),
                        ),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }

                  if (_selectedRoomNumberIds.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          AppStrings.get(context, 'select_room_instruction'),
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: Colors.white),
                        ),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }

                  final List<dynamic> roomNumbers =
                      _roomDetail?['room_numbers'] ??
                          widget.room['room_numbers'] ??
                          [];
                  final List<String> selectedRoomNumberStrings = roomNumbers
                      .where((rn) {
                        final int id = rn['id'] is int
                            ? rn['id']
                            : int.tryParse(rn['id'].toString()) ?? 0;
                        return _selectedRoomNumberIds.contains(id);
                      })
                      .map((rn) => rn['room_number']?.toString() ?? '')
                      .toList();

                  final combinedData = {
                    ...(_localSearchData ?? {}),
                    ...(_roomDetail ?? widget.room),
                    'adults': _adults,
                    'children': _children,
                    'childAges': _childAges,
                    'selectedRoomNumberIds': _selectedRoomNumberIds,
                    'selectedRoomNumbers': selectedRoomNumberStrings,
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
                  AppStrings.get(context, 'continue'),
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
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

  Widget _buildGuestSelection() {
    int multiplier =
        _selectedRoomNumberIds.length > 0 ? _selectedRoomNumberIds.length : 1;
    final int capacityAdults = (_get('capacity_adults') ?? 4) * multiplier;
    final int capacityChildren = (_get('capacity_children') ?? 4) * multiplier;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.get(context, 'guests').toUpperCase(),
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primary,
              letterSpacing: 1.1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _guestCounterRow(AppStrings.get(context, 'adults'), _adults, capacityAdults, (val) {
            setState(() => _adults = val);
          }),
          const SizedBox(height: 16),
          _guestCounterRow(AppStrings.get(context, 'children'), _children, capacityChildren, (val) {
            setState(() {
              _children = val;
              if (_childAges.length < _children) {
                _childAges.addAll(List.generate(
                    _children - _childAges.length,
                    (_) => AppStrings.get(context, 'age_less_6')));
              } else if (_childAges.length > _children) {
                _childAges = _childAges.sublist(0, _children);
              }
            });
          }),
          if (_children > 0) ...[
            const SizedBox(height: 16),
            _buildChildAgeSelectors(),
          ],
        ],
      ),
    );
  }

  Widget _guestCounterRow(
      String label, int value, int max, Function(int) onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold)),
            Text(
                label == AppStrings.get(context, 'adults')
                    ? AppStrings.get(context, 'above_12')
                    : AppStrings.get(context, 'below_12'),
                style:
                    AppTextStyles.bodySmall.copyWith(color: AppColors.outline)),
          ],
        ),
        Row(
          children: [
            _counterBtn(Icons.remove, () {
              if (value > (label == 'Children' ? 0 : 1)) onChanged(value - 1);
            }),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(value.toString(),
                  style:
                      AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold)),
            ),
            _counterBtn(Icons.add, () {
              if (value < max) {
                onChanged(value + 1);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(AppStrings.get(context, 'max_capacity_reached')
                        .replaceAll('{max}', max.toString())
                        .replaceAll('{label}', label)),
                    backgroundColor: AppColors.error));
              }
            }, isPrimary: true),
          ],
        ),
      ],
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap,
      {bool isPrimary = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isPrimary ? AppColors.primary : Colors.white,
          shape: BoxShape.circle,
          border: isPrimary
              ? null
              : Border.all(color: AppColors.surfaceContainerHigh, width: 2),
        ),
        child: Icon(icon,
            size: 18, color: isPrimary ? Colors.white : AppColors.primary),
      ),
    );
  }

  Widget _buildChildAgeSelectors() {
    return Column(
      children: List.generate(_children, (index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  AppStrings.get(context, 'child_age_label')
                      .replaceAll('{n}', (index + 1).toString()),
                  style: AppTextStyles.labelSmall
                      .copyWith(fontSize: 10, color: AppColors.outline)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.surfaceContainerHigh)),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _childAges[index],
                    isExpanded: true,
                    items: [
                      AppStrings.get(context, 'age_less_6'),
                      AppStrings.get(context, 'age_6_12'),
                      AppStrings.get(context, 'age_more_12')
                    ].map((String value) {
                      return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value,
                              style: AppTextStyles.bodySmall
                                  .copyWith(fontWeight: FontWeight.bold)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _childAges[index] = val);
                    },
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const _FullScreenImageViewer(
      {required this.images, required this.initialIndex});

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
                  child: CachedNetworkImage(
                    imageUrl: widget.images[index],
                    fit: BoxFit.contain,
                    httpHeaders: ApiService.imageHeaders,
                    placeholder: (context, url) => const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    errorWidget: (context, url, error) => const Icon(
                        Icons.broken_image,
                        color: Colors.white,
                        size: 50),
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
