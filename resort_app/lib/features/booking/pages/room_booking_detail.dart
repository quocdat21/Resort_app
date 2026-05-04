import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:convert';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import '../../room/pages/room_details_page.dart';

class RoomBookingDetailPage extends StatelessWidget {
  final Map<dynamic, dynamic> data;
  final String bookingCode;
  final String currentUserName;
  final String currentUserInitial;
  final String? currentUserAvatar;
  final NumberFormat currencyFormat;

  const RoomBookingDetailPage({
    super.key,
    required this.data,
    required this.bookingCode,
    required this.currentUserName,
    required this.currentUserInitial,
    this.currentUserAvatar,
    required this.currencyFormat,
  });

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> itemDetails =
        Map<String, dynamic>.from(data['item_details'] ?? {});
    final String itemName = itemDetails['name'] ??
        data['item_name'] ??
        data['name'] ??
        'Room Booking';
    final String imageUrl = data['main_image_url'] ??
        data['image_url'] ??
        itemDetails['image_url'] ??
        '';
    final String checkInStr = data['check_in'] ?? data['checkIn'] ?? '';
    final String checkOutStr = data['check_out'] ?? data['checkOut'] ?? '';
    final String status = data['status'] ?? 'Pending';

    // Crucial: Get real room count and room numbers from API
    final List<dynamic> roomNumbers = data['room_numbers'] ?? [];
    final int roomCount = roomNumbers.isNotEmpty
        ? roomNumbers.length
        : (data['selectedRoomNumberIds'] as List?)?.length ?? 1;

    print('DEBUG: Room numbers for detail: $roomNumbers, Count: $roomCount');

    int nights = data['nights'] ?? 1;
    if (checkInStr.isNotEmpty && checkOutStr.isNotEmpty) {
      try {
        final start = DateTime.parse(checkInStr);
        final end = DateTime.parse(checkOutStr);
        nights = end.difference(start).inDays;
        if (nights <= 0) nights = 1;
      } catch (e) {}
    }

    final double totalAmount =
        double.tryParse(data['total_amount']?.toString() ?? '0') ?? 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 20),
          _buildSuccessHeader(context, status),
          const SizedBox(height: 32),
          _buildQRCard(context, checkInStr, checkOutStr),
          const SizedBox(height: 40),
          _buildAccommodationDetails(
              context, itemName, imageUrl, itemDetails, roomNumbers),
          const SizedBox(height: 32),
          _buildExtraServices(context),
          const SizedBox(height: 32),
          _buildGuestSection(context),
          const SizedBox(height: 32),
          _buildPricingSummary(
              context, itemName, nights, roomCount, totalAmount),
          const SizedBox(height: 40),
          _buildModifyButton(context),
          const SizedBox(height: 60),
        ],
      ),
    );
  }

  Widget _buildSuccessHeader(BuildContext context, String status) {
    return Column(
      children: [
        _buildStatusIcon(status),
        const SizedBox(height: 16),
        Text(
          status.toUpperCase(),
          style: AppTextStyles.labelSmall.copyWith(
            color: _getStatusColor(status),
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Thao Nguyen Resort',
          style: AppTextStyles.h1.copyWith(
            color: const Color(0xFF1B3120),
            fontSize: 28,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Booking ID: #$bookingCode',
          style: AppTextStyles.bodySmall.copyWith(
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildQRCard(
      BuildContext context, String checkInStr, String checkOutStr) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            AppStrings.get(context, 'digital_checkin_pass'),
            style: AppTextStyles.labelSmall.copyWith(
              color: Colors.grey.shade400,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF2D4733),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: QrImageView(
                data: bookingCode,
                version: QrVersions.auto,
                size: 140.0,
                gapless: false,
                //foregroundColor: const Color(0xFF1B3120),
              ),
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildTimeInfo(
                  AppStrings.get(context, 'check_in').toUpperCase(),
                  _formatDisplayDate(context, checkInStr, true,
                      isCheckIn: true)),
              _buildTimeInfo(
                  AppStrings.get(context, 'check_out').toUpperCase(),
                  _formatDisplayDate(context, checkOutStr, true,
                      isCheckOut: true)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAccommodationDetails(
      BuildContext context,
      String itemName,
      String imageUrl,
      Map<String, dynamic> itemDetails,
      List<dynamic> roomNumbers) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(Icons.hotel_outlined,
            AppStrings.get(context, 'accommodation_details')),
        const SizedBox(height: 16),
        InkWell(
          onTap: () {
            if (itemDetails.isEmpty) return;
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => RoomDetailsPage(room: itemDetails)),
            );
          },
          borderRadius: BorderRadius.circular(24),
          child: Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.grey.shade100),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(24)),
                  child: imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: ApiService.fixImageUrl(imageUrl),
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          httpHeaders: ApiService.imageHeaders,
                        )
                      : Container(height: 180, color: Colors.grey.shade200),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(itemName,
                                style: AppTextStyles.h3
                                    .copyWith(fontWeight: FontWeight.bold)),
                          ),
                          _buildPremiumTag(),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        (itemDetails['description'] != null &&
                                itemDetails['description']
                                    .toString()
                                    .isNotEmpty)
                            ? itemDetails['description']
                            : (data['description'] != null &&
                                    data['description'].toString().isNotEmpty)
                                ? data['description']
                                : 'Thông tin phòng đang được cập nhật.',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: Colors.grey.shade600, height: 1.5),
                      ),
                      const SizedBox(height: 16),
                      _buildDynamicAmenities(
                          itemDetails['amenities'] ?? data['amenities'] ?? []),

                      // Display Room Numbers
                      if (roomNumbers.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        const Divider(height: 1),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 2),
                              child: Icon(Icons.meeting_room_outlined,
                                  size: 16, color: Color(0xFF2D472B)),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${AppStrings.get(context, 'room_number_label')}:',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.grey.shade500,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    roomNumbers.join(", "),
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF2D472B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExtraServices(BuildContext context) {
    var servicesRaw = data['selected_services'];
    List<dynamic> services = [];
    if (servicesRaw is String) {
      try {
        services = json.decode(servicesRaw);
      } catch (e) {}
    } else if (servicesRaw is List) {
      services = servicesRaw;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(Icons.add_shopping_cart_outlined,
            AppStrings.get(context, 'extra_services_included')),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade100),
          ),
          child: services.isEmpty
              ? Text(
                  'Không có dịch vụ đặt kèm.',
                  style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.grey.shade400, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                )
              : Column(
                  children: services.map((service) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_outline,
                              color: Color(0xFF2D472B), size: 18),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              service['name'] ??
                                  AppStrings.get(context, 'services'),
                              style: AppTextStyles.bodyMedium
                                  .copyWith(fontWeight: FontWeight.w600),
                            ),
                          ),
                          if (service['quantity'] != null)
                            Text('x${service['quantity']}',
                                style: AppTextStyles.bodySmall
                                    .copyWith(color: Colors.grey)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
        ),
      ],
    );
  }

  Widget _buildGuestSection(BuildContext context) {
    return Column(
      children: [
        _buildSectionHeader(
            Icons.groups_outlined, AppStrings.get(context, 'guests')),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade100),
          ),
          child: _buildGuestItem(
            currentUserInitial,
            currentUserName,
            AppStrings.get(context, 'primary_guest'),
            avatarUrl: currentUserAvatar,
          ),
        ),
      ],
    );
  }

  Widget _buildPricingSummary(BuildContext context, String itemName, int nights,
      int roomCount, double totalAmount) {
    final String checkInStr = data['check_in'] ?? data['checkIn'] ?? '';
    final String checkOutStr = data['check_out'] ?? data['checkOut'] ?? '';

    // Pricing Logic
    final double discount =
        double.tryParse(data['discount_amount']?.toString() ?? '0') ?? 0;
    final appliedVoucher = data['applied_voucher'];

    // 1. Room Price Logic
    final itemDetails = Map<String, dynamic>.from(data['item_details'] ?? {});
    final double basePrice =
        double.tryParse(itemDetails['booking_price']?.toString() ?? '') ??
            double.tryParse(data['booking_price']?.toString() ?? '') ??
            double.tryParse(itemDetails['price']?.toString() ?? '') ??
            double.tryParse(data['base_price']?.toString() ?? '0') ??
            0;
    final double roomCharge = basePrice * nights * roomCount;

    // 2. Guests & Fees
    final int adults = data['adults'] ?? 1;
    final int children = data['children'] ?? 0;
    final double extraFeeFromDb =
        double.tryParse(data['extra_fee']?.toString() ?? '0') ?? 0;
    final double childExtraFee =
        extraFeeFromDb > 0 ? extraFeeFromDb : (children * 300000.0) * nights;

    // 3. Services
    double servicesTotal = 0;
    final List<dynamic> services = data['selected_services'] ?? [];
    for (var s in services) {
      servicesTotal +=
          double.tryParse(s['total_price']?.toString() ?? '0') ?? 0;
    }

    // 4. Tax
    final double taxFromDb =
        double.tryParse(data['tax_amount']?.toString() ?? '0') ?? 0;
    final double taxToShow =
        taxFromDb > 0 ? taxFromDb : (roomCharge + childExtraFee) * 0.1;

    final double calculatedSubtotal =
        roomCharge + childExtraFee + servicesTotal + taxToShow;
    final double finalTotal =
        totalAmount > 0 ? totalAmount : (calculatedSubtotal - discount);

    return Column(
      children: [
        _buildSectionHeader(Icons.account_balance_wallet_outlined,
            AppStrings.get(context, 'pricing_summary')),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade100),
          ),
          child: Column(
            children: [
              _buildPriceRow(
                  AppStrings.get(context, 'check_in'),
                  _formatDisplayDate(context, checkInStr, true,
                      isCheckIn: true),
                  isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(
                  AppStrings.get(context, 'check_out'),
                  _formatDisplayDate(context, checkOutStr, true,
                      isCheckOut: true),
                  isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'rooms'), itemName,
                  isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'quantity'),
                  '$roomCount ${AppStrings.get(context, 'rooms').toLowerCase()} ($nights ${AppStrings.get(context, 'nights').toLowerCase()})',
                  isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'room_price'),
                  currencyFormat.format(roomCharge),
                  isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'guests'),
                  '$adults ${AppStrings.get(context, 'adults')}, $children ${AppStrings.get(context, 'children')}',
                  isBoldValue: true),
              const SizedBox(height: 12),
              if (childExtraFee > 0) ...[
                _buildPriceRow(AppStrings.get(context, 'children_extra_fee'),
                    currencyFormat.format(childExtraFee),
                    isBoldValue: true),
                const SizedBox(height: 12),
              ],
              if (servicesTotal > 0) ...[
                _buildPriceRow(AppStrings.get(context, 'services_total_label'),
                    currencyFormat.format(servicesTotal),
                    isBoldValue: true),
                const SizedBox(height: 12),
              ],
              _buildPriceRow(AppStrings.get(context, 'service_tax_label'),
                  currencyFormat.format(taxToShow),
                  isBoldValue: true),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child:
                    Divider(height: 1, color: AppColors.surfaceContainerHigh),
              ),
              _buildPriceRow(AppStrings.get(context, 'total'),
                  currencyFormat.format(calculatedSubtotal)),
              if (discount > 0) ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                        AppStrings.get(context, 'discount_label')
                            .replaceAll('{code}', ''),
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: Colors.red)),
                    Text('-${currencyFormat.format(discount)}',
                        style: AppTextStyles.bodyMedium.copyWith(
                            color: Colors.red, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(AppStrings.get(context, 'total_amount'),
                      style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF2D472B))),
                  Text('${currencyFormat.format(finalTotal)} VND',
                      style: AppTextStyles.h3.copyWith(
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF2D472B))),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildModifyButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: OutlinedButton(
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: Colors.grey.shade200),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(AppStrings.get(context, 'modify_booking'),
            style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.bold, color: const Color(0xFF2D4733))),
      ),
    );
  }

  // Helper Methods
  Widget _buildStatusIcon(String status) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: _getStatusColor(status).withOpacity(0.1),
          shape: BoxShape.circle),
      child: Icon(_getStatusIcon(status),
          color: _getStatusColor(status), size: 32),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Icons.check_circle_rounded;
      case 'pending':
        return Icons.access_time_filled_rounded;
      case 'cancelled':
        return Icons.cancel_rounded;
      default:
        return Icons.info_rounded;
    }
  }

  Widget _buildPremiumTag() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
          color: const Color(0xFFD4B483).withOpacity(0.2),
          borderRadius: BorderRadius.circular(8)),
      child: Text('PREMIUM',
          style: AppTextStyles.labelSmall.copyWith(
              color: const Color(0xFF9E7E62), fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF2D4733)),
        const SizedBox(width: 8),
        Text(title,
            style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold, color: const Color(0xFF1B3120))),
      ],
    );
  }

  Widget _buildTimeInfo(String label, String value) {
    return Column(
      crossAxisAlignment: label == 'CHECK-IN'
          ? CrossAxisAlignment.start
          : CrossAxisAlignment.end,
      children: [
        Text(label,
            style: AppTextStyles.labelSmall.copyWith(
                color: Colors.grey.shade400,
                fontWeight: FontWeight.bold,
                fontSize: 9)),
        const SizedBox(height: 4),
        Text(value,
            style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold, color: const Color(0xFF1B3120))),
      ],
    );
  }

  Widget _buildGuestItem(String initial, String name, String subtitle,
      {String? avatarUrl}) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: const Color(0xFF2D4733),
          backgroundImage: avatarUrl != null
              ? CachedNetworkImageProvider(ApiService.fixImageUrl(avatarUrl))
              : null,
          child: avatarUrl == null
              ? Text(initial,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold))
              : null,
        ),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name,
              style: AppTextStyles.bodyMedium
                  .copyWith(fontWeight: FontWeight.bold)),
          Text(subtitle,
              style: AppTextStyles.bodySmall.copyWith(color: Colors.grey)),
        ]),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value,
      {bool isBoldValue = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style:
                AppTextStyles.bodyMedium.copyWith(color: Colors.grey.shade600)),
        Text(value,
            style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: isBoldValue ? FontWeight.bold : FontWeight.normal)),
      ],
    );
  }

  String _formatDisplayDate(
      BuildContext context, String dateStr, bool includeTime,
      {bool isCheckIn = false, bool isCheckOut = false}) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      final locale = Localizations.localeOf(context).languageCode;
      final String dateFormatted = locale == 'vi'
          ? DateFormat('dd/MM/yyyy').format(date)
          : DateFormat.yMMMd(locale).format(date);
      if (includeTime) {
        if (isCheckIn) return '$dateFormatted (14:00)';
        if (isCheckOut) return '$dateFormatted (12:00)';
      }
      return dateFormatted;
    } catch (e) {
      return dateStr;
    }
  }

  Widget _buildDynamicAmenities(List<dynamic> amenities) {
    if (amenities.isEmpty) return const SizedBox.shrink();

    const int maxVisible = 3;
    final int total = amenities.length;
    final List<dynamic> visibleItems = amenities.take(maxVisible).toList();
    final int remaining = total - maxVisible;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        ...visibleItems.map((item) {
          final String name = item['name'] ?? '';
          return _buildTag(_getIconForAmenity(name), name);
        }),
        if (remaining > 0)
          _buildTag(Icons.add, '$remaining More', isRemaining: true),
      ],
    );
  }

  IconData _getIconForAmenity(String name) {
    name = name.toLowerCase();
    if (name.contains('wifi') || name.contains('internet')) return Icons.wifi;
    if (name.contains('breakfast') || name.contains('food'))
      return Icons.restaurant;
    if (name.contains('pool')) return Icons.pool;
    if (name.contains('ac') || name.contains('air conditioning'))
      return Icons.ac_unit;
    if (name.contains('tv') || name.contains('television')) return Icons.tv;
    if (name.contains('bar') || name.contains('fridge')) return Icons.local_bar;
    return Icons.check_circle_outline;
  }

  Widget _buildTag(IconData icon, String label, {bool isRemaining = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isRemaining ? Colors.grey.shade50 : const Color(0xFFF0F4F0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color:
                isRemaining ? Colors.grey.shade200 : const Color(0xFFE0E8E0)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 14,
              color: isRemaining ? Colors.grey : const Color(0xFF2D4733)),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: isRemaining ? Colors.grey : const Color(0xFF2D4733),
              fontWeight: FontWeight.w600,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}
