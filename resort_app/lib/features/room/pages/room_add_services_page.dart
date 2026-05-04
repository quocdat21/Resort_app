import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/features/room/pages/room_booking_summary_page.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:resort_app/core/widgets/loading.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class SelectServicesPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const SelectServicesPage({super.key, required this.bookingData});

  @override
  State<SelectServicesPage> createState() => _SelectServicesPageState();
}

class _SelectServicesPageState extends State<SelectServicesPage> {
  List<Map<String, dynamic>> _services = [];
  bool _isLoading = true;
  double _totalServices = 0;
  double _roomPrice = 0;

  @override
  void initState() {
    super.initState();
    _calculateRoomPrice();
    _fetchServices();
  }

  void _calculateRoomPrice() {
    final search = widget.bookingData;
    final String? checkInStr = search['checkIn'];
    final String? checkOutStr = search['checkOut'];
    int nights = 1;
    if (checkInStr != null && checkOutStr != null) {
      try {
        final checkInDate = DateFormat('yyyy-MM-dd').parse(checkInStr);
        final checkOutDate = DateFormat('yyyy-MM-dd').parse(checkOutStr);
        nights = checkOutDate.difference(checkInDate).inDays;
        if (nights <= 0) nights = 1;
      } catch (_) {}
    }

    final int basePrice = (search['base_price'] is int)
        ? search['base_price']
        : int.tryParse(search['base_price']?.toString() ?? '0') ?? 0;

    final List<int> selectedRoomNumberIds =
        search['selectedRoomNumberIds'] ?? [];
    final int roomCount =
        selectedRoomNumberIds.isEmpty ? 1 : selectedRoomNumberIds.length;

    int subtotal = basePrice * nights * roomCount;

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
    subtotal += extraFeePerNight * nights;

    final int tax = (subtotal * 0.1).round();
    _roomPrice = (subtotal + tax).toDouble();
  }

  Future<void> _fetchServices() async {
    try {
      final res = await ApiService.fetchServices(excludeType: 'Hall');
      if (res['success'] == true) {
        final data = List<Map<String, dynamic>>.from(res['data'] ?? []);
        setState(() {
          _services = data.map((s) {
            final prices = List<Map<String, dynamic>>.from(s['prices'] ?? []);
            final priceObj = prices.isNotEmpty ? prices[0] : null;
            final int price = priceObj != null
                ? (priceObj['price'] is int
                    ? priceObj['price']
                    : int.tryParse(priceObj['price'].toString()) ?? 0)
                : 0;
            final String unit =
                priceObj != null ? (priceObj['unit'] ?? 'VND') : 'VND';
            final String priceType = priceObj != null
                ? (priceObj['price_type'] ?? 'full_day')
                : 'full_day';

            String uiType = 'switch';
            dynamic value = false;
            final String unitLower = unit.toLowerCase();
            final String nameLower = (s['name'] ?? '').toLowerCase();

            if (unitLower == 'person' ||
                unitLower == 'người' ||
                unitLower == 'khách' ||
                unitLower == 'suất' ||
                unitLower == 'phần' ||
                unitLower == 'basket' ||
                unitLower == 'bó' ||
                unitLower == 'lẵng' ||
                nameLower.contains('hoa') ||
                nameLower.contains('flower') ||
                priceType == 'unit') {
              uiType = 'counter';
              value = 0;
            }

            return {
              'id': s['id'],
              'name': s['name'] ?? 'Dịch vụ',
              'description': s['description'] ?? '',
              'price': price,
              'unit': unit,
              'icon': _getIconForService(s['type'] ?? 'Other', s['name'] ?? ''),
              'image_url': s['image_url'],
              'type': uiType,
              'value': value,
            };
          }).toList();
          _isLoading = false;
        });
        _calculateTotal();
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error fetching services: $e');
      setState(() => _isLoading = false);
    }
  }

  IconData _getIconForService(String type, String name) {
    final lowerName = name.toLowerCase();
    if (lowerName.contains('âm thanh') || lowerName.contains('loa'))
      return Icons.speaker;
    if (lowerName.contains('văn nghệ') || lowerName.contains('performance'))
      return Icons.theater_comedy;
    if (lowerName.contains('lửa trại') || lowerName.contains('campfire'))
      return Icons.local_fire_department;
    if (lowerName.contains('hoa') || lowerName.contains('flower'))
      return Icons.local_florist;

    switch (type.toLowerCase()) {
      case 'food':
        return Icons.restaurant;
      case 'event':
        return Icons.celebration;
      case 'other':
        return Icons.spa;
      default:
        return Icons.miscellaneous_services;
    }
  }

  void _updateServiceValue(int index, dynamic newValue) {
    setState(() {
      _services[index]['value'] = newValue;
      _calculateTotal();
    });
  }

  void _calculateTotal() {
    double total = 0;
    for (var service in _services) {
      if (service['type'] == 'counter') {
        total += (service['price'] as int) * (service['value'] as int);
      } else if (service['type'] == 'switch' && service['value'] == true) {
        total += (service['price'] as int);
      }
    }
    _totalServices = total;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.get(context, 'select_services'),
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                _buildRoomSummaryCard(),
                const SizedBox(height: 24),
                if (_isLoading)
                  const Center(
                      child:
                          CircularProgressIndicator(color: AppColors.primary))
                else if (_services.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Text(
                      AppStrings.get(context, 'no_services_available'),
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.outline),
                    ),
                  )
                else
                  ..._services.asMap().entries.map(
                      (entry) => _buildServiceCard(entry.key, entry.value)),
                const SizedBox(height: 24),
                _buildBookingSummary(),
                const SizedBox(height: 120),
              ],
            ),
          ),
          _buildBottomActionBar(),
          if (_isLoading) const Loading(),
        ],
      ),
    );
  }

  Widget _buildRoomSummaryCard() {
    final search = widget.bookingData;
    final String roomName = search['name'] ?? 'Room';
    final String? checkInStr = search['checkIn'];
    final String? checkOutStr = search['checkOut'];
    final int adults = search['adults'] ?? 1;
    final int children = search['children'] ?? 0;

    String dates = AppStrings.get(context, 'no_dates_selected');
    if (checkInStr != null && checkOutStr != null) {
      try {
        final checkInDate = DateFormat('yyyy-MM-dd').parse(checkInStr);
        final checkOutDate = DateFormat('yyyy-MM-dd').parse(checkOutStr);
        final locale = Localizations.localeOf(context).languageCode;
        dates =
            '${DateFormat.MMMd(locale).format(checkInDate)} - ${DateFormat.MMMd(locale).format(checkOutDate)}';
      } catch (_) {}
    }

    String guests = AppStrings.get(context, 'adults_count').replaceAll('{n}', adults.toString());
    if (children > 0) guests += ', ${AppStrings.get(context, 'children_count').replaceAll('{n}', children.toString())}';

    final String? mainImage = search['main_image_url'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: mainImage != null
                ? CachedNetworkImage(
                    imageUrl: ApiService.fixImageUrl(mainImage),
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    httpHeaders: ApiService.imageHeaders,
                    placeholder: (context, url) => const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    errorWidget: (context, url, error) => Container(
                      width: 80,
                      height: 80,
                      color: AppColors.surfaceContainerHigh,
                      child: const Icon(Icons.hotel, color: AppColors.outline),
                    ),
                  )
                : Image.asset(
                    'assets/images/image_onboarding2.jpg',
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                  ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  roomName,
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 14, color: AppColors.outline),
                    const SizedBox(width: 4),
                    Text(dates,
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.outline)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.person_outline,
                        size: 14, color: AppColors.outline),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(guests,
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.outline),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(int index, Map<String, dynamic> service) {
    final bool isActive = service['type'] == 'counter'
        ? (service['value'] as int) > 0
        : (service['value'] as bool);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
            color:
                isActive ? AppColors.surfaceContainerHigh : Colors.transparent),
      ),
      child: Row(
        children: [
          if (service['image_url'] != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
                imageUrl: ApiService.fixImageUrl(service['image_url']),
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                httpHeaders: ApiService.imageHeaders,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(strokeWidth: 1),
                ),
                errorWidget: (context, url, error) => Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(service['icon'] as IconData,
                      color: AppColors.secondary, size: 24),
                ),
              ),
            )
          else
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(service['icon'] as IconData,
                  color: AppColors.secondary, size: 24),
            ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service['name'] as String,
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  service['description'] as String,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.outline),
                ),
                const SizedBox(height: 8),
                Text(
                  AppStrings.get(context, 'from_price_unit')
                      .replaceAll('{price}', NumberFormat('#,###').format(service['price']))
                      .replaceAll('{unit}', service['unit']),
                  style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.secondary),
                ),
              ],
            ),
          ),
          if (service['type'] == 'counter')
            _buildCounter(index, service['value'] as int)
          else
            Switch(
              value: service['value'] as bool,
              onChanged: (val) => _updateServiceValue(index, val),
              activeColor: AppColors.primary,
            ),
        ],
      ),
    );
  }

  Widget _buildCounter(int index, int value) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          _counterBtn(Icons.remove, () {
            if (value > 0) _updateServiceValue(index, value - 1);
          }),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(value.toString(),
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold)),
          ),
          _counterBtn(Icons.add, () => _updateServiceValue(index, value + 1),
              isPrimary: true),
        ],
      ),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap,
      {bool isPrimary = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isPrimary ? AppColors.primary : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(icon,
            size: 16, color: isPrimary ? Colors.white : AppColors.primary),
      ),
    );
  }

  Widget _buildBookingSummary() {
    final search = widget.bookingData;
    final String? checkInStr = search['checkIn'];
    final String? checkOutStr = search['checkOut'];

    int nights = 0;
    if (checkInStr != null && checkOutStr != null) {
      try {
        final checkInDate = DateFormat('yyyy-MM-dd').parse(checkInStr);
        final checkOutDate = DateFormat('yyyy-MM-dd').parse(checkOutStr);
        nights = checkOutDate.difference(checkInDate).inDays;
        if (nights <= 0) nights = 1;
      } catch (_) {}
    }

    final int basePrice = (search['base_price'] is int)
        ? search['base_price']
        : int.tryParse(search['base_price']?.toString() ?? '0') ?? 0;

    final List<int> selectedRoomNumberIds =
        List<int>.from(search['selectedRoomNumberIds'] ?? []);
    final int roomCount =
        selectedRoomNumberIds.isEmpty ? 1 : selectedRoomNumberIds.length;

    final int roomCharge = basePrice * nights * roomCount;

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
    final int totalExtraFee = extraFeePerNight * nights;

    final int subtotal = roomCharge + totalExtraFee;
    final int tax = (subtotal * 0.1).round();
    final double total = subtotal + tax + _totalServices;

    final List<dynamic> roomNumbersData = search['room_numbers'] ?? [];
    final List<String> selectedRoomNumberStrings = roomNumbersData
        .where((rn) {
          final int id = rn['id'] is int
              ? rn['id']
              : int.tryParse(rn['id'].toString()) ?? 0;
          return selectedRoomNumberIds.contains(id);
        })
        .map((rn) => rn['room_number']?.toString() ?? '')
        .toList();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.get(context, 'stay_summary_title'),
            style: AppTextStyles.labelSmall.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              color: AppColors.primary.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 16),
          _summaryRow(
              AppStrings.get(context, 'room_charge_n_nights')
                  .replaceAll('{n_rooms}', roomCount.toString())
                  .replaceAll('{n_nights}', nights.toString()),
              '${NumberFormat('#,###').format(roomCharge)} VND'),
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
          _summaryRow(AppStrings.get(context, 'services_total'),
              '${NumberFormat('#,###').format(_totalServices)} VND'),
          const SizedBox(height: 12),
          _summaryRow(AppStrings.get(context, 'service_fee_tax'),
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
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline)),
        Text(value,
            style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primary, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBottomActionBar() {
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
                Text(AppStrings.get(context, 'final_amount'),
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9,
                        color: AppColors.outline,
                        fontWeight: FontWeight.bold)),
                Text(
                  '${NumberFormat('#,###').format(_roomPrice + _totalServices)} VND',
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
                  final selectedServices = _services.where((s) {
                    if (s['type'] == 'counter') return (s['value'] as int) > 0;
                    return (s['value'] as bool) == true;
                  }).toList();

                  final finalData = {
                    ...widget.bookingData,
                    'selectedServices': selectedServices,
                    'totalServicesPrice': _totalServices,
                    'totalRoomPrice': _roomPrice,
                    'totalFinalPrice': _roomPrice + _totalServices,
                  };

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          BookingSummaryPage(bookingData: finalData),
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
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      AppStrings.get(context, 'continue'),
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward, size: 18),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
