import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/room/pages/room_details_page.dart';
import 'package:resort_app/features/room/pages/rooms_search.dart';

class RoomsSearchResults extends StatefulWidget {
  final Map<String, dynamic>? filters;

  const RoomsSearchResults({super.key, this.filters});

  @override
  State<RoomsSearchResults> createState() => _RoomsSearchResultsState();
}

class _RoomsSearchResultsState extends State<RoomsSearchResults> {
  List<Map<String, dynamic>> _rooms = [];
  bool _isLoading = true;
  String? _error;
  int _totalRooms = 0;

  // Filter & sort state
  String? _selectedFilterType;
  String? _selectedZoneId;
  String? _sortOrder; // null = default, 'ASC' = ascending, 'DESC' = descending

  // Zone data from API
  List<Map<String, dynamic>> _zones = [];
  String? _avatarUrl;

  // 4 representative room type filters
  final List<Map<String, String>> _filterTypes = [
    {'key': 'Twin', 'label': 'Twin', 'icon': 'twin'},
    {'key': 'Double', 'label': 'Double', 'icon': 'double'},
    {'key': 'Triple', 'label': 'Triple', 'icon': 'triple'},
    {'key': 'Villa', 'label': 'Villa', 'icon': 'villa'},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.filters != null && widget.filters!['searchTerm'] != null) {
      _selectedFilterType = widget.filters!['searchTerm'];
    }
    if (widget.filters != null && widget.filters!['zoneId'] != null) {
      _selectedZoneId = widget.filters!['zoneId'];
    }
    _loadZones();
    _fetchRooms();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final user = await ApiService.getUser();
      if (mounted) {
        setState(() {
          _avatarUrl = user?['avatar_url'];
        });
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
    }
  }

  Future<void> _loadZones() async {
    try {
      final result = await ApiService.getFilterMeta();
      if (result['success'] == true) {
        final data = result['data'];
        setState(() {
          _zones = List<Map<String, dynamic>>.from(data['zones'] ?? []);
        });
      }
    } catch (e) {
      debugPrint('Error loading zones: $e');
    }
  }

  Future<void> _fetchRooms() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final f = widget.filters ?? {};
      final result = await ApiService.searchRooms(
        adults: f['adults'] as int?,
        children: f['children'] as int?,
        minPrice: f['minPrice'] as int?,
        maxPrice: f['maxPrice'] as int?,
        zoneId: _selectedZoneId ?? f['zoneId'] as String?,
        searchTerm: _selectedFilterType,
        checkIn: f['checkIn'] as String?,
        checkOut: f['checkOut'] as String?,
        sortBy: 'base_price',
        sortOrder: _sortOrder ?? 'ASC',
        limit: 50,
      );
      if (result['success'] == true) {
        setState(() {
          _rooms = List<Map<String, dynamic>>.from(result['data'] ?? []);
          _totalRooms = result['pagination']?['total'] ?? _rooms.length;
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = result['message'] ?? AppStrings.get(context, 'failed_load_rooms');
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Không thể kết nối đến server: $e';
        _isLoading = false;
      });
    }
  }

  String _buildSearchLabel() {
    final f = widget.filters;
    if (f == null || f.isEmpty) return 'Moc Chau • ${AppStrings.get(context, 'all_rooms')}';

    final parts = <String>['Moc Chau'];
    if (f['checkIn'] != null && f['checkOut'] != null) {
      parts.add('${f['checkIn']} → ${f['checkOut']}');
    }
    if (f['adults'] != null && f['adults'] > 0) {
      parts.add('${f['adults']} ${AppStrings.get(context, 'adults')}');
    }
    return parts.join(' • ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildSearchHeader(),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 1),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.cloud_off, size: 64, color: AppColors.outline),
              const SizedBox(height: 16),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.outline),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _fetchRooms,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(AppStrings.get(context, 'retry')),
              ),
            ],
          ),
        ),
      );
    }

    if (_rooms.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.hotel_outlined,
                size: 64, color: AppColors.outline),
            const SizedBox(height: 16),
            Text(
              AppStrings.get(context, 'no_rooms_found'),
              style: AppTextStyles.h3.copyWith(color: AppColors.outline),
            ),
            const SizedBox(height: 8),
            Text(
              AppStrings.get(context, 'adjust_filters'),
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchRooms,
      color: AppColors.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            Text(
              'MOC CHAU, VIETNAM',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.secondary,
                letterSpacing: 1.2,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Found $_totalRooms Sanctuaries',
              style: AppTextStyles.h2.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildFilterSortButtons(),
            const SizedBox(height: 24),
            ..._rooms.map((room) => _buildRoomCard(room)),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu, color: AppColors.primary),
            onPressed: () {},
          ),
          Expanded(
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        RoomsSearch(initialFilters: widget.filters),
                  ),
                );
              },
              child: Container(
                height: 44,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.surfaceContainerHigh),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search,
                        size: 18, color: AppColors.secondary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _buildSearchLabel(),
                        style: AppTextStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Icon(Icons.edit_outlined,
                        size: 18, color: AppColors.secondary),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.surfaceContainerHigh,
            backgroundImage: (_avatarUrl != null && _avatarUrl!.isNotEmpty)
                ? NetworkImage(ApiService.fixImageUrl(_avatarUrl!))
                : const AssetImage('assets/icons/profile.png') as ImageProvider,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSortButtons() {
    // Determine sort icon
    IconData sortIcon;
    if (_sortOrder == null) {
      sortIcon = Icons.swap_vert;
    } else if (_sortOrder == 'ASC') {
      sortIcon = Icons.arrow_upward;
    } else {
      sortIcon = Icons.arrow_downward;
    }

    final bool hasActiveFilter =
        _selectedFilterType != null || _selectedZoneId != null;
    final List<String> activeLabels = [];
    if (_selectedFilterType != null) activeLabels.add(_selectedFilterType!);
    if (_selectedZoneId != null) {
      final zone = _zones.firstWhere(
        (z) => z['id'].toString() == _selectedZoneId,
        orElse: () => <String, dynamic>{},
      );
      if (zone.isNotEmpty) activeLabels.add(zone['name'] ?? '');
    }

    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: _showCategoryFilterSheet,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: hasActiveFilter
                    ? AppColors.primary.withOpacity(0.1)
                    : AppColors.surfaceContainerHigh.withOpacity(0.4),
                borderRadius: BorderRadius.circular(30),
                border: hasActiveFilter
                    ? Border.all(color: AppColors.primary.withOpacity(0.3))
                    : null,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.tune, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      hasActiveFilter
                          ? activeLabels.join(' • ').toUpperCase()
                          : 'FILTER',
                      style: AppTextStyles.labelSmall.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () {
              setState(() {
                if (_sortOrder == null) {
                  _sortOrder = 'ASC';
                } else if (_sortOrder == 'ASC') {
                  _sortOrder = 'DESC';
                } else {
                  _sortOrder = 'ASC';
                }
              });
              _fetchRooms();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHigh.withOpacity(0.4),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'PRICE',
                    style: AppTextStyles.labelSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(sortIcon, size: 16, color: AppColors.primary),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showCategoryFilterSheet() {
    // Use StatefulBuilder so the bottom sheet can update its own UI
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetContext) {
        String? tempFilterType = _selectedFilterType;
        String? tempZoneId = _selectedZoneId;

        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.75,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Handle bar + header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 20),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainerHigh,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Filters',
                              style: AppTextStyles.h3.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary),
                            ),
                            if (tempFilterType != null || tempZoneId != null)
                              GestureDetector(
                                onTap: () {
                                  setSheetState(() {
                                    tempFilterType = null;
                                    tempZoneId = null;
                                  });
                                },
                                child: Text(
                                  'Clear All',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.error,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                  // Scrollable filter content
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ── ROOM TYPE SECTION ──
                          Text(
                            'ROOM TYPE',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.secondary,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _buildFilterOption(
                            icon: Icons.hotel,
                            label: 'All Room Types',
                            isSelected: tempFilterType == null,
                            onTap: () {
                              setSheetState(() => tempFilterType = null);
                            },
                          ),
                          ..._filterTypes.map((type) {
                            final key = type['key']!;
                            return _buildFilterOption(
                              icon: _getFilterIcon(key),
                              label: type['label']!,
                              isSelected: tempFilterType == key,
                              onTap: () {
                                setSheetState(() => tempFilterType = key);
                              },
                            );
                          }),
                          const SizedBox(height: 24),

                          // ── ZONE SECTION ──
                          Text(
                            'ZONE',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.secondary,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _buildFilterOption(
                            icon: Icons.location_on_outlined,
                            label: 'All Zones',
                            isSelected: tempZoneId == null,
                            onTap: () {
                              setSheetState(() => tempZoneId = null);
                            },
                          ),
                          ..._zones.map((zone) {
                            final zoneId = zone['id'].toString();
                            final zoneName = zone['name'] ?? 'Zone';
                            return _buildFilterOption(
                              icon: Icons.map_outlined,
                              label: zoneName,
                              isSelected: tempZoneId == zoneId,
                              onTap: () {
                                setSheetState(() => tempZoneId = zoneId);
                              },
                            );
                          }),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                  // Apply button
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                    child: SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _selectedFilterType = tempFilterType;
                            _selectedZoneId = tempZoneId;
                          });
                          Navigator.pop(context);
                          _fetchRooms();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          'Apply Filters',
                          style: AppTextStyles.bodyLarge.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  IconData _getFilterIcon(String key) {
    switch (key) {
      case 'Twin':
        return Icons.bed;
      case 'Double':
        return Icons.king_bed;
      case 'Triple':
        return Icons.bedroom_parent;
      case 'Villa':
        return Icons.villa;
      default:
        return Icons.hotel;
    }
  }

  Widget _buildFilterOption({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.1)
              : AppColors.surfaceContainerHigh.withOpacity(0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.primary : AppColors.outline,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppColors.primary : AppColors.onSurface,
                ),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle,
                  color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildRoomCard(Map<String, dynamic> room) {
    final String? imageUrl = room['main_image_url'];
    final String name = room['name'] ?? 'Unknown Room';
    final int basePrice = (room['base_price'] is int)
        ? room['base_price']
        : int.tryParse(room['base_price']?.toString() ?? '0') ?? 0;
    final String? avgRating = room['avg_rating']?.toString();
    final int availableCount = room['available_count'] ?? 0;
    final String sizeSqm = room['size_sqm']?.toString() ?? '';
    final int capacityAdults = room['capacity_adults'] ?? 2;
    final int capacityChildren = room['capacity_children'] ?? 0;
    final String zoneName = room['zone_name'] ?? 'Resort';
    final String categoryName = room['category_name'] ?? '';
    final String shortDesc =
        '${sizeSqm}m² • $capacityAdults Adults${capacityChildren > 0 ? ' + $capacityChildren Children' : ''} • $categoryName';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => RoomDetailsPage(
              room: room,
              searchData: widget.filters,
            ),
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
                    aspectRatio: 1,
                    child: imageUrl != null
                        ? Image.network(
                            ApiService.fixImageUrl(imageUrl),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: AppColors.surfaceContainerHigh,
                              child: const Icon(Icons.hotel,
                                  size: 48, color: AppColors.outline),
                            ),
                          )
                        : Container(
                            color: AppColors.surfaceContainerHigh,
                            child: const Icon(Icons.hotel,
                                size: 48, color: AppColors.outline),
                          ),
                  ),
                ),
                if (avgRating != null)
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star,
                              size: 14, color: Colors.orange),
                          const SizedBox(width: 4),
                          Text(
                            avgRating,
                            style: AppTextStyles.bodySmall
                                .copyWith(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (availableCount <= 3 && availableCount > 0)
                  Positioned(
                    top: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$availableCount LEFT',
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
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 14, color: AppColors.secondary),
                const SizedBox(width: 4),
                Text(
                  zoneName.toUpperCase(),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              name,
              style: AppTextStyles.h3.copyWith(
                  fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            const SizedBox(height: 4),
            Text(
              shortDesc,
              style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.outline, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Starts from',
                      style: AppTextStyles.bodySmall
                          .copyWith(fontSize: 10, color: AppColors.outline),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${NumberFormat('#,###').format(basePrice)} VND',
                      style: AppTextStyles.h3.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RoomDetailsPage(room: room),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
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
