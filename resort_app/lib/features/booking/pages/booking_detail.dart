import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import '../../room/pages/room_details_page.dart';

class BookingDetailPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;
  final String bookingCode;

  const BookingDetailPage({
    super.key,
    required this.bookingCode,
    this.bookingData = const {},
  });

  @override
  State<BookingDetailPage> createState() => _BookingDetailPageState();
}

class _BookingDetailPageState extends State<BookingDetailPage> {
  Map<String, dynamic>? _fetchedData;
  String _currentUserName = 'Guest';
  String _currentUserInitial = 'G';
  String? _currentUserAvatar;
  bool _isLoadingUser = true;
  bool _isLoadingBooking = false;
  final NumberFormat _currencyFormat = NumberFormat('#,###', 'vi_VN');

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _fetchBookingDetail();
  }

  Future<void> _fetchBookingDetail() async {
    setState(() => _isLoadingBooking = true);
    try {
      final response = await ApiService.get('/bookings/${widget.bookingCode}');
      if (response['success']) {
        setState(() {
          _fetchedData = response['data'];
          _isLoadingBooking = false;
        });
      } else {
        setState(() => _isLoadingBooking = false);
      }
    } catch (e) {
      debugPrint('Error fetching booking detail: $e');
      setState(() => _isLoadingBooking = false);
    }
  }

  Future<void> _loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user_data');
      if (userJson != null) {
        final userData = json.decode(userJson);
        final fullName = userData['full_name'] ?? 'Guest';
        setState(() {
          _currentUserName = fullName;
          _currentUserInitial =
              fullName.isNotEmpty ? fullName[0].toUpperCase() : 'G';
          _currentUserAvatar = userData['avatar_url'];
          _isLoadingUser = false;
        });
      } else {
        setState(() => _isLoadingUser = false);
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
      setState(() => _isLoadingUser = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingBooking) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final data = _fetchedData ?? widget.bookingData;
    if (data.isEmpty) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(AppStrings.get(context, 'no_booking_data'))),
      );
    }

    final itemDetails = data['item_details'] ?? {};
    final String roomName =
        itemDetails['name'] ?? data['name'] ?? 'Hillside Zen Suite';
    final String imageUrl = data['main_image_url'] ?? data['image_url'] ?? '';
    final String checkInStr = data['check_in'] ?? data['checkIn'] ?? '';
    final String checkOutStr = data['check_out'] ?? data['checkOut'] ?? '';
    final String status = data['status'] ?? 'Pending';

    // Calculate nights
    int nights = 1;
    if (checkInStr.isNotEmpty && checkOutStr.isNotEmpty) {
      try {
        final start = DateTime.parse(checkInStr);
        final end = DateTime.parse(checkOutStr);
        nights = end.difference(start).inDays;
        if (nights <= 0) nights = 1;
      } catch (e) {}
    }

    // Pricing Logic
    final bool isRoom = data['type'] == 'room';
    final double totalAmount =
        double.tryParse(data['total_amount']?.toString() ?? '0') ?? 0;
    final double discount =
        double.tryParse(data['discount_amount']?.toString() ?? '0') ?? 0;
    final appliedVoucher = data['applied_voucher'];

    List<Widget> priceRows = [];
    double calculatedSubtotal = 0;

    if (isRoom) {
      // 1. Dates
      priceRows.add(_buildPriceRow(
          AppStrings.get(context, 'check_in'), _formatDisplayDate(checkInStr, true, isCheckIn: true),
          isBoldValue: true));
      priceRows.add(const SizedBox(height: 8));
      priceRows.add(_buildPriceRow(
          AppStrings.get(context, 'check_out'), _formatDisplayDate(checkOutStr, true, isCheckOut: true),
          isBoldValue: true));
      priceRows.add(const SizedBox(height: 16));

      // 2. Room Info
      priceRows.add(_buildPriceRow(AppStrings.get(context, 'rooms'), roomName, isBoldValue: true));
      priceRows.add(const SizedBox(height: 8));

      final List<dynamic> roomNumbers = data['room_numbers'] ?? [];
      final int roomCount = roomNumbers.isEmpty ? 1 : roomNumbers.length;
      priceRows.add(_buildPriceRow(AppStrings.get(context, 'quantity'), '$roomCount ${AppStrings.get(context, 'rooms').toLowerCase()} ($nights ${AppStrings.get(context, 'nights').toLowerCase()})',
          isBoldValue: true));

      if (roomNumbers.isNotEmpty) {
        priceRows.add(const SizedBox(height: 4));
        priceRows.add(Text(
          '${AppStrings.get(context, 'room_numbers')}: ${roomNumbers.join(', ')}',
          style: AppTextStyles.bodySmall
              .copyWith(color: const Color(0xFFA0A0A0), fontSize: 11),
        ));
      }
      priceRows.add(const SizedBox(height: 16));

      // 3. Room Price
      final double basePrice =
          double.tryParse(itemDetails['base_price']?.toString() ?? '0') ?? 0;
      final double roomCharge = basePrice * nights * roomCount;
      priceRows.add(_buildPriceRow(
          AppStrings.get(context, 'room_price'), _currencyFormat.format(roomCharge),
          isBoldValue: true));
      calculatedSubtotal += roomCharge;
      priceRows.add(const SizedBox(height: 8));

      // 4. Guests
      final int adults = data['adults'] ?? 1;
      final int children = data['children'] ?? 0;
      priceRows.add(_buildPriceRow(
          AppStrings.get(context, 'guests'), '$adults ${AppStrings.get(context, 'adults')}, $children ${AppStrings.get(context, 'children')}',
          isBoldValue: true));
      priceRows.add(const SizedBox(height: 8));

      // 5. Children Extra Fee
      final double extraFeeFromDb = double.tryParse(data['extra_fee']?.toString() ?? '0') ?? 0;
      final double feeToShow = extraFeeFromDb > 0 ? extraFeeFromDb : (children * 300000.0) * nights;
      
      if (feeToShow > 0) {
        priceRows.add(_buildPriceRow(
            AppStrings.get(context, 'children_extra_fee'), _currencyFormat.format(feeToShow),
            isBoldValue: true));
        calculatedSubtotal += feeToShow;
        priceRows.add(const SizedBox(height: 16));
      }

      // 6. Selected Services
      final List<dynamic> services = data['selected_services'] ?? [];
      if (services.isNotEmpty) {
        priceRows.add(Text(
          AppStrings.get(context, 'amenities'),
          style: AppTextStyles.labelSmall.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 10,
            color: AppColors.primary.withOpacity(0.7),
          ),
        ));
        priceRows.add(const SizedBox(height: 8));
        for (var item in services) {
          final sPrice =
              double.tryParse(item['total_price']?.toString() ?? '0') ?? 0;
          priceRows.add(Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _buildPriceRow('• ${item['name'] ?? 'Service'}',
                _currencyFormat.format(sPrice),
                isBoldValue: true),
          ));
          calculatedSubtotal += sPrice;
        }
        priceRows.add(const SizedBox(height: 8));
      }

      // 7. Tax
      final double taxFromDb = double.tryParse(data['tax_amount']?.toString() ?? '0') ?? 0;
      final double taxToShow = taxFromDb > 0 ? taxFromDb : (roomCharge + feeToShow) * 0.1;
      priceRows.add(_buildPriceRow(
          'Service Fee & Taxes (10%)', _currencyFormat.format(taxToShow),
          isBoldValue: true));
      calculatedSubtotal += taxToShow;
    } else {
      // Service booking breakdown (Simpler)
      final double servicePrice =
          double.tryParse(itemDetails['booking_price']?.toString() ?? '0') ?? 0;
      final int qty = itemDetails['quantity'] ?? 1;
      final double totalService = servicePrice * qty;

      priceRows.add(_buildPriceRow('Check-in',
          _formatDisplayDate(data['service_booking_date'] ?? '', false),
          isBoldValue: true));
      priceRows.add(const SizedBox(height: 16));
      priceRows.add(_buildPriceRow('Item', roomName, isBoldValue: true));
      priceRows.add(const SizedBox(height: 8));
      priceRows.add(_buildPriceRow('Quantity', 'x$qty', isBoldValue: true));
      priceRows.add(const SizedBox(height: 16));
      priceRows.add(_buildPriceRow(
          'Price', _currencyFormat.format(totalService),
          isBoldValue: true));
      calculatedSubtotal = totalService;
    }

    // Final total adjustment
    final double subtotalToShow = calculatedSubtotal;
    final double discountToShow = subtotalToShow - totalAmount;

    // Discount Label with percentage
    String discountLabel = 'Discount';
    if (appliedVoucher != null) {
      if (appliedVoucher['discount_type'] == 'percentage') {
        discountLabel = 'Discount (${appliedVoucher['discount_value']}%)';
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFDFDF9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF2D4733)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.get(context, 'booking_details'),
          style: AppTextStyles.h3.copyWith(
            color: const Color(0xFF2D4733),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          children: [
            const SizedBox(height: 20),

            // Success Header
            Column(
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
                  'Booking ID: #${widget.bookingCode}',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Digital Check-in Pass Card
            Container(
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
                        data: widget.bookingCode,
                        version: QrVersions.auto,
                        size: 140.0,
                        gapless: false,
                        foregroundColor: const Color(0xFF1B3120),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildTimeInfo(
                          AppStrings.get(context, 'check_in').toUpperCase(),
                          _formatDisplayDate(checkInStr, true,
                              isCheckIn: true)),
                      _buildTimeInfo(
                          AppStrings.get(context, 'check_out').toUpperCase(),
                          _formatDisplayDate(checkOutStr, true,
                              isCheckOut: true)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // Accommodation Details
            _buildSectionHeader(Icons.hotel_outlined, AppStrings.get(context, 'accommodation_details')),
            const SizedBox(height: 16),
            InkWell(
              onTap: () {
                if (isRoom && itemDetails.isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RoomDetailsPage(room: itemDetails),
                    ),
                  );
                }
              },
              borderRadius: BorderRadius.circular(24),
              child: Container(
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
                          ? Image.network(ApiService.fixImageUrl(imageUrl),
                              height: 180,
                              width: double.infinity,
                              fit: BoxFit.cover)
                          : Container(
                              height: 180,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.image, color: Colors.grey)),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(roomName,
                                  style: AppTextStyles.h3
                                      .copyWith(fontWeight: FontWeight.bold)),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD4B483).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text('PREMIUM',
                                    style: AppTextStyles.labelSmall.copyWith(
                                        color: const Color(0xFF9E7E62),
                                        fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            data['description'] ??
                                'King size bed, private balcony with forest view, and outdoor stone bathtub.',
                            style: AppTextStyles.bodySmall.copyWith(
                                color: Colors.grey.shade600, height: 1.5),
                          ),
                          const SizedBox(height: 16),
                          _buildDynamicAmenities(data['amenities'] ?? []),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Guests Section
            _buildSectionHeader(Icons.groups_outlined, AppStrings.get(context, 'guests')),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                children: [
                  _isLoadingUser
                      ? const Center(child: CircularProgressIndicator())
                      : _buildGuestItem(
                          _currentUserInitial,
                          _currentUserName,
                          AppStrings.get(context, 'primary_guest'),
                          avatarUrl: _currentUserAvatar,
                        ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Pricing Summary Section
            _buildSectionHeader(
                Icons.account_balance_wallet_outlined, AppStrings.get(context, 'pricing_summary')),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...priceRows,
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Divider(
                        height: 1, color: AppColors.surfaceContainerHigh),
                  ),
                  _buildPriceRow(
                      AppStrings.get(context, 'total'), _currencyFormat.format(subtotalToShow)),
                  if (discountToShow > 10) ...[
                    const SizedBox(height: 12),
                    _buildPriceRow(
                      discountLabel,
                      '-${_currencyFormat.format(discountToShow)}',
                      isDiscount: true,
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
                      Text('${_currencyFormat.format(totalAmount)} VND',
                          style: AppTextStyles.h3.copyWith(
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF2D472B))),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // Modify Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.grey.shade200),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(
                  AppStrings.get(context, 'modify_booking'),
                  style: AppTextStyles.labelSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF2D4733),
                    letterSpacing: 1.2,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '${AppStrings.get(context, 'cancellation_policy')} Oct 20, 2024',
              style: AppTextStyles.bodySmall
                  .copyWith(color: Colors.grey.shade400, fontSize: 10),
            ),

            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  String _formatDisplayDate(String dateStr, bool includeTime,
      {bool isCheckIn = false, bool isCheckOut = false}) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      final String dateFormatted = DateFormat('dd MMM yyyy').format(date);
      
      if (includeTime) {
        if (isCheckIn) {
          return '$dateFormatted (14:00)';
        }
        if (isCheckOut) {
          return '$dateFormatted (12:00)';
        }
        return '$dateFormatted (${DateFormat('HH:mm').format(date)})';
      }
      return dateFormatted;
    } catch (e) {
      return dateStr;
    }
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
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.bold, color: const Color(0xFF1B3120)),
          textAlign: label == 'CHECK-IN' ? TextAlign.left : TextAlign.right,
        ),
      ],
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

  Widget _buildDynamicAmenities(List<dynamic> amenities) {
    if (amenities.isEmpty) {
      // Fallback if no amenities in data
      amenities = [
        {'name': 'Free Wi-Fi'},
        {'name': 'Breakfast'},
        {'name': 'Pool Access'}
      ];
    }

    final int maxVisible = 3;
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
    if (name.contains('ac') || name.contains('air')) return Icons.ac_unit;
    if (name.contains('tv')) return Icons.tv;
    if (name.contains('bath') || name.contains('shower'))
      return Icons.bathtub_outlined;
    if (name.contains('parking')) return Icons.local_parking;
    if (name.contains('gym')) return Icons.fitness_center;
    return Icons.star_border;
  }

  Widget _buildTag(IconData icon, String label, {bool isRemaining = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isRemaining
            ? AppColors.primary.withOpacity(0.1)
            : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: isRemaining
            ? Border.all(color: AppColors.primary.withOpacity(0.2))
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 14,
              color: isRemaining ? AppColors.primary : Colors.grey.shade500),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: isRemaining ? AppColors.primary : Colors.grey.shade600,
              fontSize: 11,
              fontWeight: isRemaining ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestItem(String initial, String name, String role,
      {String? avatarUrl}) {
    return Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: const Color(0xFFD4B483).withOpacity(0.3),
          backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty)
              ? NetworkImage(ApiService.fixImageUrl(avatarUrl))
              : null,
          child: (avatarUrl == null || avatarUrl.isEmpty)
              ? Text(initial,
                  style: const TextStyle(
                      color: Color(0xFF9E7E62),
                      fontWeight: FontWeight.bold,
                      fontSize: 14))
              : null,
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name,
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold)),
            Text(role,
                style: AppTextStyles.labelSmall.copyWith(
                    color: Colors.grey.shade400,
                    fontSize: 9,
                    fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value,
      {bool isDiscount = false, bool isBoldValue = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style:
                AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade600),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: isBoldValue ? FontWeight.bold : FontWeight.normal,
            color: isDiscount ? Colors.red : const Color(0xFF1B3120),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusIcon(String status) {
    IconData icon;
    Color color = _getStatusColor(status);
    switch (status) {
      case 'Confirmed':
        icon = Icons.check_circle_outline;
        break;
      case 'Pending':
        icon = Icons.hourglass_empty;
        break;
      case 'Cancelled':
        icon = Icons.cancel_outlined;
        break;
      case 'Completed':
        icon = Icons.task_alt;
        break;
      default:
        icon = Icons.info_outline;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 28),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Confirmed':
        return Colors.green;
      case 'Pending':
        return Colors.orange;
      case 'Cancelled':
        return Colors.red;
      case 'Completed':
        return AppColors.primary;
      default:
        return Colors.grey;
    }
  }
}
