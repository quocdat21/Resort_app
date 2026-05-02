import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/payment/pages/payment.dart';
import 'package:intl/intl.dart';

class BookingSummaryPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const BookingSummaryPage({super.key, required this.bookingData});

  @override
  State<BookingSummaryPage> createState() => _BookingSummaryPageState();
}

class _BookingSummaryPageState extends State<BookingSummaryPage> {
  final TextEditingController _promoController = TextEditingController();
  Map<String, dynamic>? _appliedVoucher;
  double _discountAmount = 0;
  bool _isApplyingPromo = false;
  int? _userId;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  void _loadUser() async {
    final user = await ApiService.getUser();
    if (user != null) {
      setState(() {
        _userId = user['id'];
      });
    }
  }

  void _applyPromo() async {
    final code = _promoController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isApplyingPromo = true);

    final data = widget.bookingData;
    final double currentTotal =
        double.tryParse((data['totalFinalPrice'] ?? 0).toString()) ?? 0.0;

    try {
      final res = await ApiService.validateVoucher(
        code: code,
        orderValue: currentTotal,
        userId: _userId,
      );

      if (res['success'] == true) {
        final voucher = res['data'];
        double discount = 0;
        final discountValue =
            double.tryParse(voucher['discount_value'].toString()) ?? 0;

        if (voucher['discount_type'] == 'percentage') {
          discount = currentTotal * (discountValue / 100);
          final maxDiscount =
              double.tryParse(voucher['max_discount']?.toString() ?? '');
          if (maxDiscount != null && discount > maxDiscount) {
            discount = maxDiscount;
          }
        } else {
          discount = discountValue;
        }

        setState(() {
          _appliedVoucher = voucher;
          _discountAmount = discount;
          _isApplyingPromo = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(res['message'] ?? 'Áp dụng mã thành công'),
                backgroundColor: Colors.green),
          );
        }
      } else {
        setState(() {
          _appliedVoucher = null;
          _discountAmount = 0;
          _isApplyingPromo = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(res['message'] ?? 'Mã không hợp lệ'),
                backgroundColor: AppColors.error),
          );
        }
      }
    } catch (e) {
      setState(() => _isApplyingPromo = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Lỗi kết nối server'),
              backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.bookingData;
    final List<dynamic> services = data['selectedServices'] ?? [];

    final double subtotal =
        double.tryParse((data['totalFinalPrice'] ?? 0).toString()) ?? 0.0;
    final double finalTotal = subtotal - _discountAmount;

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
          'Review Booking',
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildRoomHeroCard(),
                  const SizedBox(height: 20),
                  _buildDateTimeSection(),
                  const SizedBox(height: 16),
                  _buildTravelersSection(),
                  if (services.isNotEmpty) ...[
                    const SizedBox(height: 32),
                    _buildSectionTitle('SELECTED SERVICES'),
                    const SizedBox(height: 16),
                    _buildServicesSection(services),
                  ],
                  const SizedBox(height: 32),
                  _buildSectionTitle('PRICE BREAKDOWN'),
                  const SizedBox(height: 16),
                  _buildPriceBreakdownCard(finalTotal),
                  const SizedBox(height: 24),
                  _buildSectionTitle('DISCOUNT CODE'),
                  const SizedBox(height: 8),
                  _buildPromoInput(),
                  const SizedBox(height: 40),
                  _buildContinueButton(finalTotal),
                  const SizedBox(height: 16),
                  _buildTermsDisclaimer(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicesSection(List<dynamic> services) {
    return Column(
      children: services.map((s) {
        final int price = s['price'] ?? 0;
        final int qty = (s['type'] == 'counter') ? (s['value'] as int) : 1;
        final String priceStr = NumberFormat('#,###').format(price * qty);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.surfaceContainerHigh),
          ),
          child: Row(
            children: [
              s['image_url'] != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        ApiService.fixImageUrl(s['image_url']),
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(s['icon'] as IconData,
                              color: AppColors.secondary, size: 20),
                        ),
                      ),
                    )
                  : Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(s['icon'] as IconData,
                          color: AppColors.secondary, size: 20),
                    ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s['name'],
                      style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary),
                    ),
                    if (s['type'] == 'counter')
                      Text(
                        'Quantity: $qty',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.outline),
                      ),
                  ],
                ),
              ),
              Text(
                '$priceStr VND',
                style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold, color: AppColors.secondary),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelSmall.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.primary,
        letterSpacing: 1.1,
      ),
    );
  }

  Widget _buildRoomHeroCard() {
    final data = widget.bookingData;
    final String roomName = data['name'] ?? 'Retreat';
    final String? imageUrl = data['main_image_url'];

    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: imageUrl != null
            ? DecorationImage(
                image: NetworkImage(ApiService.fixImageUrl(imageUrl)),
                fit: BoxFit.cover,
              )
            : const DecorationImage(
                image: AssetImage('assets/images/image_onboarding2.jpg'),
                fit: BoxFit.cover,
              ),
      ),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SELECTED RETREAT',
                  style: AppTextStyles.labelSmall.copyWith(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  roomName,
                  style: AppTextStyles.h2.copyWith(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeSection() {
    final data = widget.bookingData;
    final String? checkInStr = data['checkIn'];
    final String? checkOutStr = data['checkOut'];

    String checkIn = '-';
    String checkOut = '-';

    if (checkInStr != null && checkOutStr != null) {
      try {
        final ci = DateTime.parse(checkInStr);
        final co = DateTime.parse(checkOutStr);
        checkIn = DateFormat('MMM dd, yyyy').format(ci);
        checkOut = DateFormat('MMM dd, yyyy').format(co);
      } catch (_) {}
    }

    return Row(
      children: [
        Expanded(child: _buildInfoBox('CHECK-IN', checkIn, 'from 2:00 PM')),
        const SizedBox(width: 12),
        Expanded(child: _buildInfoBox('CHECK-OUT', checkOut, 'until 12:00 PM')),
      ],
    );
  }

  Widget _buildInfoBox(String label, String value, String subValue) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: AppTextStyles.labelSmall.copyWith(
                  fontSize: 9,
                  color: AppColors.outline,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value,
              style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold, color: AppColors.primary)),
          Text(subValue,
              style: AppTextStyles.bodySmall
                  .copyWith(fontSize: 10, color: AppColors.outline)),
        ],
      ),
    );
  }

  Widget _buildTravelersSection() {
    final data = widget.bookingData;
    final int adults = data['adults'] ?? 0;
    final int children = data['children'] ?? 0;
    final List<int> rooms = List<int>.from(data['selectedRoomNumberIds'] ?? []);

    String travelers = '$adults Adults';
    if (children > 0) travelers += ', $children Children';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TRAVELERS & ACCOMMODATION',
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9,
                        color: AppColors.outline,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(
                    '$travelers • ${rooms.length} Room${rooms.length > 1 ? 's' : ''}',
                    style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary)),
              ],
            ),
          ),
          const Icon(Icons.group_outlined, color: AppColors.primary, size: 24),
        ],
      ),
    );
  }

  Widget _buildPriceBreakdownCard(double finalTotal) {
    final data = widget.bookingData;
    final String? ci = data['checkIn'];
    final String? co = data['checkOut'];

    int nights = 1;
    if (ci != null && co != null) {
      try {
        nights = DateTime.parse(co).difference(DateTime.parse(ci)).inDays;
        if (nights <= 0) nights = 1;
      } catch (_) {}
    }

    final int basePrice = (data['base_price'] is int)
        ? data['base_price']
        : int.tryParse(data['base_price']?.toString() ?? '0') ?? 0;

    final List<int> selectedRoomNumberIds =
        List<int>.from(data['selectedRoomNumberIds'] ?? []);
    final int roomCount =
        selectedRoomNumberIds.isEmpty ? 1 : selectedRoomNumberIds.length;

    final int roomCharge = basePrice * nights * roomCount;

    int extraFeePerNight = 0;
    int under6Count = 0;
    final List<dynamic> childAges = data['childAges'] ?? [];
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
    final double servicesTotal =
        double.tryParse((data['totalServicesPrice'] ?? 0).toString()) ?? 0.0;

    final int subtotalForTax = roomCharge + totalExtraFee;
    final int tax = (subtotalForTax * 0.1).round();

    final List<dynamic> roomNumbersData = data['room_numbers'] ?? [];
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
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 20,
              offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'STAY SUMMARY',
            style: AppTextStyles.labelSmall.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              color: AppColors.primary.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 16),
          _summaryRow('Room Charge ($roomCount room × $nights nights)',
              '${NumberFormat('#,###').format(roomCharge)} VND'),
          if (selectedRoomNumberStrings.isNotEmpty) ...[
            const SizedBox(height: 12),
            _summaryRow('Room Numbers', selectedRoomNumberStrings.join(', ')),
          ],
          if (totalExtraFee > 0) ...[
            const SizedBox(height: 12),
            _summaryRow('Children Extra Fee',
                '${NumberFormat('#,###').format(totalExtraFee)} VND'),
          ],
          const SizedBox(height: 12),
          _summaryRow('Services Total',
              '${NumberFormat('#,###').format(servicesTotal)} VND'),
          const SizedBox(height: 12),
          _summaryRow('Service Fee & Taxes (10%)',
              '${NumberFormat('#,###').format(tax)} VND'),
          if (_discountAmount > 0) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Discount (${_appliedVoucher?['code']})',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.secondary)),
                Text('- ${NumberFormat('#,###').format(_discountAmount)} VND',
                    style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.bold)),
              ],
            ),
          ],
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Divider(height: 1, color: AppColors.surfaceContainerHigh),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text('Total Amount',
                    style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary)),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text('${NumberFormat('#,###').format(finalTotal)} VND',
                      style: AppTextStyles.h3.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary)),
                ),
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
        Expanded(
          child: Text(label,
              style:
                  AppTextStyles.bodyMedium.copyWith(color: AppColors.outline)),
        ),
        const SizedBox(width: 8),
        Text(value,
            style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.primary, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildPromoInput() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: _promoController,
              decoration: const InputDecoration(
                hintText: 'Enter code',
                border: InputBorder.none,
                isDense: true,
              ),
              style: AppTextStyles.bodyMedium,
            ),
          ),
          ElevatedButton(
            onPressed: _isApplyingPromo ? null : _applyPromo,
            style: ElevatedButton.styleFrom(
              backgroundColor: _appliedVoucher != null
                  ? Colors.green
                  : const Color(0xFFDCC19F),
              foregroundColor:
                  _appliedVoucher != null ? Colors.white : AppColors.primary,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: _isApplyingPromo
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.primary))
                : Text(_appliedVoucher != null ? 'APPLIED' : 'APPLY',
                    style: AppTextStyles.labelSmall
                        .copyWith(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildContinueButton(double finalTotal) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: () {
          final dataToPass = Map<String, dynamic>.from(widget.bookingData);
          dataToPass['discount'] = _discountAmount;
          dataToPass['total_amount'] = finalTotal;
          dataToPass['appliedVoucher'] = _appliedVoucher;
          dataToPass['services'] = widget.bookingData[
              'selectedServices']; // Map to expected key in PaymentPage

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PaymentPage(
                bookingData: {
                  ...dataToPass,
                  'userId': _userId,
                },
              ),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 4,
          shadowColor: AppColors.primary.withOpacity(0.3),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Continue',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildTermsDisclaimer() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        'By tapping "Pay Now" you agree to Thao Nguyen Resort\'s Terms of Service and Cancellation Policy.',
        textAlign: TextAlign.center,
        style: AppTextStyles.bodySmall
            .copyWith(fontSize: 10, color: AppColors.outline, height: 1.5),
      ),
    );
  }
}
