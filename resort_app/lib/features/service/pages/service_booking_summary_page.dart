import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';
import 'package:resort_app/features/payment/pages/payment.dart';
import 'package:intl/intl.dart';

class ServiceBookingSummaryPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const ServiceBookingSummaryPage({super.key, required this.bookingData});

  @override
  State<ServiceBookingSummaryPage> createState() =>
      _ServiceBookingSummaryPageState();
}

class _ServiceBookingSummaryPageState extends State<ServiceBookingSummaryPage> {
  final TextEditingController _promoController = TextEditingController();
  Map<String, dynamic>? _appliedVoucher;
  double _discountAmount = 0;
  bool _isApplyingPromo = false;

  late DateTime _selectedDate;
  int _peopleCount = 1;
  int? _userId;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.bookingData['date'] ?? DateTime.now();
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

  static const Color darkGreen = Color(0xFF2D472B);

  void _applyPromo() async {
    final code = _promoController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isApplyingPromo = true);

    final data = widget.bookingData;
    final package = data['package'];
    final double basePrice =
        double.tryParse((package['price'] ?? 0).toString()) ?? 0.0;

    final bool isFixedPriceType = data['service']?['type'] == 'Hall' ||
        data['service']?['type'] == 'Event';
    final double currentTotal =
        isFixedPriceType ? basePrice : basePrice * _peopleCount;

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

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    return NumberFormat('#,###').format(double.tryParse(price.toString()) ?? 0);
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.bookingData;
    final service = data['service'];
    final package = data['package'];

    final double basePrice =
        double.tryParse((package['price'] ?? 0).toString()) ?? 0.0;

    final bool isFixedPriceType =
        service['type'] == 'Hall' || service['type'] == 'Event';
    final double subtotal =
        isFixedPriceType ? basePrice : basePrice * _peopleCount;

    const double serviceFee = 12000; // Mock service fee
    final double finalTotal = subtotal + serviceFee - _discountAmount;

    return Scaffold(
      backgroundColor: const Color(0xFFFBFBF9),
      appBar: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1D2120)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Thao Nguyen Resort',
          style: AppTextStyles.h3.copyWith(
              fontWeight: FontWeight.bold, color: const Color(0xFF1D2120)),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined,
                color: Color(0xFF1D2120)),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildServiceHeroCard(service),
                  const SizedBox(height: 28),
                  _buildBookingDateDisplay(),
                  const SizedBox(height: 28),
                  _buildPeopleSection(service['type']),
                  const SizedBox(height: 28),
                  _buildPriceSummaryCard(service['name'] ?? 'Service',
                      service['type'], basePrice, serviceFee, finalTotal),
                  const SizedBox(height: 24),
                  const Text(
                    'DISCOUNT CODE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: darkGreen,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildPromoInput(),
                  const SizedBox(height: 32),
                  _buildConfirmButton(finalTotal),
                  const SizedBox(height: 16),
                  const Center(
                    child: Text(
                      'SECURE PAYMENT POWERED BY SANCTUARYPAY',
                      style: TextStyle(
                        color: Color(0xFFA0A0A0),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 2),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: darkGreen),
        ),
        if (subtitle.isNotEmpty)
          Text(
            subtitle,
            style: AppTextStyles.bodySmall
                .copyWith(color: const Color(0xFFA0A0A0)),
          ),
      ],
    );
  }

  Widget _buildServiceHeroCard(dynamic service) {
    final String serviceName = service['name'] ?? 'Ancient Stone Therapy';
    final String? imageUrl = service['image_url'];

    return Container(
      height: 160,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        image: imageUrl != null
            ? DecorationImage(
                image: NetworkImage(imageUrl),
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
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black.withOpacity(0.6)],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCC19F).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    service['type']?.toString().toUpperCase() ?? 'THERAPEUTIC',
                    style: const TextStyle(
                      color: darkGreen,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  serviceName,
                  style: AppTextStyles.h2.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 24),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingDateDisplay() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF3F3F1)),
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
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F3F1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.calendar_today_outlined,
                color: darkGreen, size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ngày đặt dịch vụ',
                style: AppTextStyles.bodySmall
                    .copyWith(color: const Color(0xFFA0A0A0)),
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
                style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1D2120)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPeopleSection(dynamic type) {
    if (type == 'Hall' || type == 'Event') return const SizedBox.shrink();

    String label = 'Số lượng';
    String desc = 'Vui lòng chọn số lượng';

    if (type == 'Food') {
      label = 'Số suất';
      desc = 'Vui lòng chọn số suất ăn';
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.h3
                  .copyWith(fontWeight: FontWeight.bold, color: darkGreen),
            ),
            Text(
              desc,
              style: AppTextStyles.bodySmall
                  .copyWith(color: const Color(0xFFA0A0A0)),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF3F3F1),
            borderRadius: BorderRadius.circular(30),
          ),
          child: Row(
            children: [
              _counterButton(Icons.remove, () {
                if (_peopleCount > 1) setState(() => _peopleCount--);
              }),
              const SizedBox(width: 16),
              Text(
                '$_peopleCount',
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1D2120)),
              ),
              const SizedBox(width: 16),
              _counterButton(Icons.add, () {
                if (_peopleCount < 100) setState(() => _peopleCount++);
              }, isPrimary: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _counterButton(IconData icon, VoidCallback onTap,
      {bool isPrimary = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isPrimary ? darkGreen : Colors.white,
          shape: BoxShape.circle,
        ),
        child: Icon(icon,
            size: 18,
            color: isPrimary ? Colors.white : const Color(0xFF1D2120)),
      ),
    );
  }

  Widget _buildPriceSummaryCard(String serviceName, dynamic type,
      double basePrice, double fee, double total) {
    String qtyLabel = 'x$_peopleCount';
    if (type == 'Hall' || type == 'Event') {
      qtyLabel = '';
    } else if (type == 'Food') {
      qtyLabel = '($_peopleCount suất)';
    } else {
      qtyLabel = '($_peopleCount)';
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F3F1),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          _summaryRow('$serviceName $qtyLabel',
              '${_formatPrice(basePrice * (type == 'Hall' || type == 'Event' ? 1 : _peopleCount))} VND'),
          const SizedBox(height: 12),
          _summaryRow('Service Fee', '${_formatPrice(fee)} VND'),
          if (_discountAmount > 0) ...[
            const SizedBox(height: 12),
            _summaryRow('Discount (${_appliedVoucher?['code']})',
                '-${_formatPrice(_discountAmount)} VND',
                isDiscount: true),
          ],
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Divider(height: 1, color: Color(0xFFE0E0E0)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total',
                style: AppTextStyles.h3
                    .copyWith(fontWeight: FontWeight.bold, color: darkGreen),
              ),
              Text(
                '${_formatPrice(total)} VND',
                style: AppTextStyles.h2
                    .copyWith(fontWeight: FontWeight.bold, color: darkGreen),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style:
              AppTextStyles.bodyMedium.copyWith(color: const Color(0xFFA0A0A0)),
        ),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            color: isDiscount ? Colors.red : const Color(0xFF1D2120),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildPromoInput() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F3F1),
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
              backgroundColor:
                  _appliedVoucher != null ? Colors.green : darkGreen,
              foregroundColor: Colors.white,
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
                        strokeWidth: 2, color: Colors.white))
                : Text(_appliedVoucher != null ? 'APPLIED' : 'APPLY',
                    style: const TextStyle(
                        fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmButton(double finalTotal) {
    return SizedBox(
      width: double.infinity,
      height: 64,
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PaymentPage(
                bookingData: {
                  'service': widget.bookingData['service'],
                  'package': widget.bookingData['package'],
                  'date': _selectedDate,
                  'guests': _peopleCount,
                  'discount': _discountAmount,
                  'total_amount': finalTotal,
                  'appliedVoucher': _appliedVoucher,
                  'userId': _userId,
                },
              ),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: darkGreen,
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 0,
        ),
        child: Text(
          'CONFIRM BOOKING',
          style: AppTextStyles.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.0,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
