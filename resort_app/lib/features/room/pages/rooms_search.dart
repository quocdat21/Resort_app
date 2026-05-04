import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/widgets/loading.dart';

import 'package:resort_app/features/room/pages/rooms_search_results.dart';

class RoomsSearch extends StatefulWidget {
  final Map<String, dynamic>? initialFilters;
  const RoomsSearch({super.key, this.initialFilters});
 
  @override
  State<RoomsSearch> createState() => _RoomsSearchState();
}
 
class _RoomsSearchState extends State<RoomsSearch> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _rangeStart;
  DateTime? _rangeEnd;
  
  int _adults = 0;
  int _children = 0;
  List<String> _childAges = [];
  
  String? _selectedZoneId;
  double _maxPriceDb = 10000000;
  RangeValues _priceRange = const RangeValues(0, 10000000);

  // Data from DB
  List<Map<String, dynamic>> _zones = [];
  bool _isLoadingMeta = true;

  @override
  void initState() {
    super.initState();
    _loadFilterMeta();
    _initFromFilters();
  }

  void _initFromFilters() {
    final f = widget.initialFilters;
    if (f == null) return;

    if (f['checkIn'] != null) {
      _rangeStart = DateFormat('yyyy-MM-dd').parse(f['checkIn']);
      _focusedDay = _rangeStart!;
    }
    if (f['checkOut'] != null) {
      _rangeEnd = DateFormat('yyyy-MM-dd').parse(f['checkOut']);
    }
    if (f['adults'] != null) {
      _adults = f['adults'] is int ? f['adults'] : int.tryParse(f['adults'].toString()) ?? 0;
    }
    if (f['children'] != null) {
      _children = f['children'] is int ? f['children'] : int.tryParse(f['children'].toString()) ?? 0;
    }
    if (f['childAges'] != null && f['childAges'] is List) {
      _childAges = List<String>.from(f['childAges']);
    }
    if (f['zoneId'] != null) {
      _selectedZoneId = f['zoneId'].toString();
    }
    if (f['minPrice'] != null || f['maxPrice'] != null) {
      double start = (f['minPrice'] ?? 0).toDouble();
      double end = (f['maxPrice'] ?? _maxPriceDb).toDouble();
      _priceRange = RangeValues(start, end);
    }
  }

  Future<void> _loadFilterMeta() async {
    try {
      final result = await ApiService.getFilterMeta();
      if (result['success'] == true) {
        final data = result['data'];
        final zones = List<Map<String, dynamic>>.from(data['zones'] ?? []);
        final maxPrice = (data['maxPrice'] ?? 10000000).toDouble();

        setState(() {
          _zones = zones;
          _maxPriceDb = maxPrice;
          _priceRange = RangeValues(0, maxPrice);
          _isLoadingMeta = false;
        });
      } else {
        setState(() => _isLoadingMeta = false);
      }
    } catch (e) {
      debugPrint('Error loading filter meta: $e');
      setState(() => _isLoadingMeta = false);
    }
  }

  void _resetFilters() {
    setState(() {
      _rangeStart = null;
      _rangeEnd = null;
      _adults = 0;
      _children = 0;
      _childAges = [];
      _selectedZoneId = null;
      _priceRange = RangeValues(0, _maxPriceDb);
      _focusedDay = DateTime.now();
    });
    // Pop back to results with no filters = all rooms
    Navigator.pop(context);
  }

  void _performSearch() {
    if (_rangeStart == null || _rangeEnd == null || _adults == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Vui lòng chọn ngày Check-in, Check-out và số người lớn!',
            style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => RoomsSearchResults(
          filters: {
            if (_rangeStart != null) 'checkIn': DateFormat('yyyy-MM-dd').format(_rangeStart!),
            if (_rangeEnd != null) 'checkOut': DateFormat('yyyy-MM-dd').format(_rangeEnd!),
            if (_adults > 0) 'adults': _adults,
            if (_children > 0) 'children': _children,
            if (_children > 0) 'childAges': _childAges,
            if (_selectedZoneId != null) 'zoneId': _selectedZoneId,
            if (_priceRange.start > 0) 'minPrice': _priceRange.start.round(),
            if (_priceRange.end < _maxPriceDb) 'maxPrice': _priceRange.end.round(),
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.onBackground),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Find Sanctuary',
          style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: _resetFilters,
            child: Text(
              'RESET',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.secondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionHeader('YOUR STAY', 'Check-in & Out'),
                const SizedBox(height: 16),
                _buildDateDisplay(),
                const SizedBox(height: 16),
                _buildCalendar(),
                const SizedBox(height: 32),
                _buildSectionHeader('CAPACITY', 'Number of Guests'),
                const SizedBox(height: 16),
                _buildGuestCounter('Adults', 'Ages 13 or above', _adults,
                    (val) => setState(() => _adults = val)),
                const SizedBox(height: 16),
                _buildGuestCounter('Children', 'Ages 2 - 12', _children, (val) {
                  setState(() {
                    _children = val;
                    if (_childAges.length < _children) {
                      _childAges.addAll(List.generate(
                          _children - _childAges.length,
                          (_) => '< 6 years old'));
                    } else if (_childAges.length > _children) {
                      _childAges = _childAges.sublist(0, _children);
                    }
                  });
                }),
                if (_children > 0) ...[
                  const SizedBox(height: 16),
                  _buildChildAgeSelectors(),
                ],
                const SizedBox(height: 32),
                _buildSectionHeader('LOCATION', 'Zone'),
                const SizedBox(height: 16),
                _buildZoneSelector(),
                const SizedBox(height: 32),
                _buildSectionHeader(
                  'INVESTMENT',
                  'Price Range',
                  trailing:
                      '${NumberFormat('#,###').format(_priceRange.start.round())} - ${NumberFormat('#,###').format(_priceRange.end.round())} VND',
                ),
                const SizedBox(height: 16),
                _buildPriceRangeSelector(),
                const SizedBox(height: 40),
                _buildSearchButton(),
                const SizedBox(height: 24),
              ],
            ),
          ),
          if (_isLoadingMeta) const Loading(),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String overline, String title, {String? trailing}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              overline,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.secondary,
                letterSpacing: 1.2,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: AppTextStyles.h2.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        if (trailing != null)
          Flexible(
            child: Text(
              trailing,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.secondary,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.right,
            ),
          ),
      ],
    );
  }

  Widget _buildDateDisplay() {
    return Row(
      children: [
        Expanded(
          child: _dateBox('ARRIVAL', _rangeStart != null ? DateFormat('MMM dd, yyyy').format(_rangeStart!) : 'Select Date'),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _dateBox('DEPARTURE', _rangeEnd != null ? DateFormat('MMM dd, yyyy').format(_rangeEnd!) : 'Select Date'),
        ),
      ],
    );
  }

  Widget _dateBox(String label, String date) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.secondary.withOpacity(0.6),
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            date,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalendar() {
    final now = DateTime.now();
    DateTime firstSelectableDay = DateTime(now.year, now.month, now.day);
    
    // If it's past 14:00 (2 PM), users must book from tomorrow
    if (now.hour >= 14) {
      firstSelectableDay = firstSelectableDay.add(const Duration(days: 1));
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: TableCalendar(
        firstDay: firstSelectableDay,
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: _focusedDay.isBefore(firstSelectableDay) ? firstSelectableDay : _focusedDay,
        rangeStartDay: _rangeStart,
        rangeEndDay: _rangeEnd,
        rangeSelectionMode: RangeSelectionMode.enforced,
        enabledDayPredicate: (day) {
          // Disable days before today
          return !day.isBefore(firstSelectableDay);
        },
        onRangeSelected: (start, end, focusedDay) {
          setState(() {
            _rangeStart = start;
            _rangeEnd = end;
            _focusedDay = focusedDay;
          });
        },
        headerStyle: HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
          titleTextStyle: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
          leftChevronIcon: const Icon(Icons.chevron_left, color: AppColors.primary),
          rightChevronIcon: const Icon(Icons.chevron_right, color: AppColors.primary),
        ),
        calendarStyle: CalendarStyle(
          outsideDaysVisible: false,
          disabledTextStyle: const TextStyle(color: Color(0xFFD5D5D5)),
          rangeHighlightColor: AppColors.primary.withOpacity(0.1),
          rangeStartDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          rangeEndDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          withinRangeTextStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
          todayDecoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          selectedDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  Widget _buildGuestCounter(String label, String subtitle, int value, Function(int) onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            Text(
              subtitle,
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline),
            ),
          ],
        ),
        Row(
          children: [
            _counterButton(Icons.remove, () {
              if (value > 0) onChanged(value - 1);
            }),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                value.toString(),
                style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold),
              ),
            ),
            _counterButton(Icons.add, () => onChanged(value + 1), isFilled: true),
          ],
        ),
      ],
    );
  }

  Widget _counterButton(IconData icon, VoidCallback onTap, {bool isFilled = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: isFilled ? AppColors.primary : Colors.white,
          shape: BoxShape.circle,
          border: isFilled ? null : Border.all(color: AppColors.surfaceContainerHigh, width: 2),
        ),
        child: Icon(
          icon,
          size: 20,
          color: isFilled ? Colors.white : AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildChildAgeSelectors() {
    return Row(
      children: List.generate(_children, (index) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index == _children - 1 ? 0 : 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CHILD ${index + 1} AGE',
                  style: AppTextStyles.labelSmall.copyWith(fontSize: 10, color: AppColors.outline, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _childAges[index],
                      isExpanded: true,
                      icon: const Icon(Icons.expand_more, size: 20),
                      items: ['< 6 years old', '6 - 12 years old', '> 12 years old']
                          .map((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value, style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _childAges[index] = val;
                          });
                        }
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildZoneSelector() {
    // Add an "All Zones" option at the beginning
    final allOptions = [
      {'id': null, 'name': 'All Zones'},
      ..._zones,
    ];

    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: allOptions.length,
        itemBuilder: (context, index) {
          final zone = allOptions[index];
          final zoneId = zone['id']?.toString();
          final isSelected = _selectedZoneId == zoneId;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedZoneId = zoneId),
            child: Container(
              width: 160,
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? Colors.white : AppColors.surfaceContainerHigh.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  width: 2,
                ),
                boxShadow: isSelected ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ] : null,
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'ZONE',
                        style: AppTextStyles.labelSmall.copyWith(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppColors.outline : AppColors.outline.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        zone['name'] as String,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.outline.withOpacity(0.3),
                          width: 2,
                        ),
                        color: isSelected ? AppColors.primary : Colors.transparent,
                      ),
                      child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPriceRangeSelector() {
    return Column(
      children: [
        RangeSlider(
          values: _priceRange,
          min: 0,
          max: _maxPriceDb,
          divisions: (_maxPriceDb / 100000).round().clamp(1, 100),
          activeColor: AppColors.primary,
          inactiveColor: AppColors.surfaceContainerHigh,
          onChanged: (values) {
            setState(() {
              _priceRange = values;
            });
          },
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _priceBox('MINIMUM', '${NumberFormat('#,###').format(_priceRange.start.round())}đ'),
            _priceBox('MAXIMUM', '${NumberFormat('#,###').format(_priceRange.end.round())}đ'),
          ],
        ),
      ],
    );
  }

  Widget _priceBox(String label, String value) {
    return Container(
      width: 140,
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(fontSize: 8, color: AppColors.outline, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _performSearch,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          elevation: 8,
          shadowColor: AppColors.primary.withOpacity(0.4),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search, size: 24),
            const SizedBox(width: 12),
            Text(
              'SEARCH SANCTUARIES',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
