import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import '../../service/pages/service_details_page.dart';

class ServiceBookingDetailPage extends StatelessWidget {
  final Map<dynamic, dynamic> data;
  final String bookingCode;
  final String currentUserName;
  final String currentUserInitial;
  final String? currentUserAvatar;
  final NumberFormat currencyFormat;

  const ServiceBookingDetailPage({
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
    final Map<String, dynamic> itemDetails = Map<String, dynamic>.from(data['item_details'] ?? {});
    final String itemName = itemDetails['name'] ?? data['item_name'] ?? data['name'] ?? 'Service Booking';
    final String imageUrl = data['main_image_url'] ?? data['image_url'] ?? itemDetails['image_url'] ?? '';
    final String serviceDateStr = data['service_booking_date'] ?? data['date']?.toString() ?? '';
    final String status = data['status'] ?? 'Pending';

    final double totalAmount = double.tryParse(data['total_amount']?.toString() ?? '0') ?? 0;
    final int qty = data['guests'] ?? itemDetails['quantity'] ?? 1;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 20),
          _buildSuccessHeader(context, status),
          const SizedBox(height: 32),
          _buildQRCard(context, serviceDateStr),
          const SizedBox(height: 40),
          _buildServiceDetails(context, itemName, imageUrl, itemDetails),
          const SizedBox(height: 32),
          _buildGuestSection(context),
          const SizedBox(height: 32),
          _buildPricingSummary(context, itemName, qty, totalAmount),
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

  Widget _buildQRCard(BuildContext context, String serviceDateStr) {
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
            'DIGITAL SERVICE PASS',
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
                foregroundColor: const Color(0xFF1B3120),
              ),
            ),
          ),
          const SizedBox(height: 32),
          _buildTimeInfo(AppStrings.get(context, 'service_booking_date').toUpperCase(), _formatDisplayDate(context, serviceDateStr, false)),
        ],
      ),
    );
  }

  Widget _buildServiceDetails(BuildContext context, String itemName, String imageUrl, Map<String, dynamic> itemDetails) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(Icons.spa_outlined, AppStrings.get(context, 'service_details')),
        const SizedBox(height: 16),
        InkWell(
          onTap: () {
            if (itemDetails.isEmpty) return;
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => ServiceDetailsPage(service: itemDetails)),
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
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
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
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(itemName, style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Text(
                        (itemDetails['description'] != null && itemDetails['description'].toString().isNotEmpty)
                            ? itemDetails['description']
                            : (data['description'] != null && data['description'].toString().isNotEmpty)
                                ? data['description']
                                : 'Thông tin dịch vụ đang được cập nhật.',
                        style: AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade600, height: 1.6),
                      ),
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

  Widget _buildGuestSection(BuildContext context) {
    return Column(
      children: [
        _buildSectionHeader(Icons.groups_outlined, AppStrings.get(context, 'guests')),
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

  Widget _buildPricingSummary(BuildContext context, String itemName, int qty, double totalAmount) {
    final itemDetails = Map<String, dynamic>.from(data['item_details'] ?? {});
    final String serviceDateStr = data['service_booking_date'] ?? data['date']?.toString() ?? '';
    final double discount = double.tryParse(data['discount_amount']?.toString() ?? '0') ?? 0;
    
    final double servicePrice = double.tryParse(itemDetails['booking_price']?.toString() ?? '') ?? 
                            double.tryParse(data['booking_price']?.toString() ?? '') ?? 
                            double.tryParse(itemDetails['price']?.toString() ?? '') ?? 
                            double.tryParse(itemDetails['total_price']?.toString() ?? '0') ?? 0;
    
    final double subtotal = servicePrice * qty;
    final double taxAmount = double.tryParse(data['tax_amount']?.toString() ?? '0') ?? (subtotal * 0.1);
    final double calculatedSubtotal = subtotal + taxAmount;
    final double finalTotal = totalAmount > 0 ? totalAmount : (calculatedSubtotal - discount);

    return Column(
      children: [
        _buildSectionHeader(Icons.account_balance_wallet_outlined, AppStrings.get(context, 'pricing_summary')),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade100),
          ),
          child: Column(
            children: [
              _buildPriceRow(AppStrings.get(context, 'service_booking_date'), _formatDisplayDate(context, serviceDateStr, false), isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'services'), itemName, isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'quantity'), 'x$qty', isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'unit_price'), currencyFormat.format(servicePrice), isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'amount_label'), currencyFormat.format(subtotal), isBoldValue: true),
              const SizedBox(height: 12),
              _buildPriceRow(AppStrings.get(context, 'service_tax_label'), currencyFormat.format(taxAmount), isBoldValue: true),
              
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Divider(height: 1, color: AppColors.surfaceContainerHigh),
              ),
              _buildPriceRow(AppStrings.get(context, 'total'), currencyFormat.format(calculatedSubtotal)),
              if (discount > 0) ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppStrings.get(context, 'discount_label').replaceAll('{code}', ''), style: AppTextStyles.bodyMedium.copyWith(color: Colors.red)),
                    Text('-${currencyFormat.format(discount)}', style: AppTextStyles.bodyMedium.copyWith(color: Colors.red, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(AppStrings.get(context, 'total_amount'), style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF2D472B))),
                  Text('${currencyFormat.format(finalTotal)} VND', style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF2D472B))),
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text('LIÊN HỆ ĐỔI LỊCH', style: AppTextStyles.labelSmall.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF2D4733))),
      ),
    );
  }

  // Helper Methods
  Widget _buildStatusIcon(String status) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: _getStatusColor(status).withOpacity(0.1), shape: BoxShape.circle),
      child: Icon(_getStatusIcon(status), color: _getStatusColor(status), size: 32),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed': return Colors.green;
      case 'pending': return Colors.orange;
      case 'cancelled': return Colors.red;
      default: return Colors.blue;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed': return Icons.check_circle_rounded;
      case 'pending': return Icons.access_time_filled_rounded;
      case 'cancelled': return Icons.cancel_rounded;
      default: return Icons.info_rounded;
    }
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF2D4733)),
        const SizedBox(width: 8),
        Text(title, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1B3120))),
      ],
    );
  }

  Widget _buildTimeInfo(String label, String value) {
    return Column(
      children: [
        Text(label, style: AppTextStyles.labelSmall.copyWith(color: Colors.grey.shade400, fontWeight: FontWeight.bold, fontSize: 9)),
        const SizedBox(height: 4),
        Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1B3120))),
      ],
    );
  }

  Widget _buildGuestItem(String initial, String name, String subtitle, {String? avatarUrl}) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: const Color(0xFF2D4733),
          backgroundImage: avatarUrl != null ? CachedNetworkImageProvider(ApiService.fixImageUrl(avatarUrl)) : null,
          child: avatarUrl == null ? Text(initial, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)) : null,
        ),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
          Text(subtitle, style: AppTextStyles.bodySmall.copyWith(color: Colors.grey)),
        ]),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value, {bool isBoldValue = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium.copyWith(color: Colors.grey.shade600)),
        Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: isBoldValue ? FontWeight.bold : FontWeight.normal)),
      ],
    );
  }

  String _formatDisplayDate(BuildContext context, String dateStr, bool includeTime) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      final locale = Localizations.localeOf(context).languageCode;
      final String dateFormatted = locale == 'vi'
          ? DateFormat('dd/MM/yyyy').format(date)
          : DateFormat.yMMMd(locale).format(date);
      if (includeTime) return '$dateFormatted (${DateFormat('HH:mm').format(date)})';
      return dateFormatted;
    } catch (e) { return dateStr; }
  }
}
