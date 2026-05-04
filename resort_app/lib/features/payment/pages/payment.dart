import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/payment/pages/qr_payment_page.dart';

class PaymentPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const PaymentPage({super.key, required this.bookingData});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  String _selectedMethod = 'BANK_TRANSFER';
  bool _isProcessing = false;
  final NumberFormat _currencyFormat = NumberFormat('#,###', 'vi_VN');
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

  @override
  Widget build(BuildContext context) {
    final data = widget.bookingData;
    final isService = data.containsKey('service');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Thao Nguyen Resort',
          style: AppTextStyles.h3.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              if (isService)
                _buildServiceSummaryCard(data)
              else
                _buildRoomSummaryCard(data),
              const SizedBox(height: 32),
              Text(
                'SELECT PAYMENT METHOD',
                style: AppTextStyles.labelSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: const Color(0xFF1D2120),
                ),
              ),
              const SizedBox(height: 16),
              _buildPaymentMethodItem(
                id: 'BANK_TRANSFER',
                title: 'Chuyển khoản ngân hàng',
                subtitle: 'Instant Local Transfer',
                icon: Icons.account_balance_outlined,
                isSelected: _selectedMethod == 'BANK_TRANSFER',
                isComingSoon: false,
              ),
              _buildPaymentMethodItem(
                id: 'VNPAY',
                title: 'e-wallet',
                subtitle: 'MoMo, VNPAY, ZaloPay',
                icon: Icons.account_balance_wallet_outlined,
                isSelected: _selectedMethod == 'VNPAY',
                isComingSoon: true,
              ),
              _buildPaymentMethodItem(
                id: 'CREDIT_CARD',
                title: 'CREDIT CARD',
                subtitle: 'Visa, Mastercard, JCB',
                icon: Icons.credit_card_outlined,
                isSelected: _selectedMethod == 'CREDIT_CARD',
                isComingSoon: true,
              ),
              _buildPaymentMethodItem(
                id: 'CASH',
                title: 'cash',
                subtitle: 'Pay at front desk',
                icon: Icons.payments_outlined,
                isSelected: _selectedMethod == 'CASH',
                isComingSoon: true,
              ),
              const SizedBox(height: 32),
              const Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.lock_outline,
                        size: 14, color: Color(0xFFA0A0A0)),
                    SizedBox(width: 8),
                    Text(
                      'SECURE ENCRYPTED CHECKOUT',
                      style: TextStyle(
                        color: Color(0xFFA0A0A0),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomButton(),
    );
  }

  Widget _buildRoomSummaryCard(Map<String, dynamic> data) {
    final room = data['room'] ?? data;
    final checkIn = data['checkIn'] is DateTime
        ? data['checkIn'] as DateTime?
        : DateTime.tryParse(data['checkIn']?.toString() ?? '');
    final checkOut = data['checkOut'] is DateTime
        ? data['checkOut'] as DateTime?
        : DateTime.tryParse(data['checkOut']?.toString() ?? '');

    int nights = 1;
    if (checkIn != null && checkOut != null) {
      nights = checkOut.difference(checkIn).inDays;
      if (nights <= 0) nights = 1;
    }

    final int basePrice = (data['base_price'] is int)
        ? data['base_price']
        : int.tryParse(data['base_price']?.toString() ?? '0') ?? 0;

    final List<int> selectedRoomNumberIds =
        List<int>.from(data['selectedRoomNumberIds'] ?? []);
    final int roomCount =
        selectedRoomNumberIds.isEmpty ? 1 : selectedRoomNumberIds.length;
    final int adults = data['adults'] ?? 1;
    final int children = data['children'] ?? 0;

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

    final List<dynamic> services = data['services'] ?? [];
    final double servicesTotal = services.fold(0.0, (sum, item) {
      if (item == null) return sum;
      return sum + (double.tryParse(item['price']?.toString() ?? '0') ?? 0);
    });
    final int subtotalForTax = roomCharge + totalExtraFee;
    final int tax = (subtotalForTax * 0.1).round();

    final double discount =
        double.tryParse(data['discount']?.toString() ?? '0') ?? 0;

    final double totalBeforeDiscount = subtotalForTax + tax + servicesTotal;
    final double totalAmount = totalBeforeDiscount - discount;

    final dateFormat = DateFormat('dd MMM yyyy');

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceContainerHigh),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
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

          // Dates
          if (checkIn != null && checkOut != null) ...[
            _buildSummaryRow(
                'Check-in', '${dateFormat.format(checkIn)} (14:00)'),
            const SizedBox(height: 8),
            _buildSummaryRow(
                'Check-out', '${dateFormat.format(checkOut)} (12:00)'),
            const SizedBox(height: 16),
          ],

          // Room Details
          _buildSummaryRow('Room', room['name'] ?? 'Room'),
          const SizedBox(height: 8),
          _buildSummaryRow('Quantity', '$roomCount phòng ($nights đêm)'),
          if (selectedRoomNumberStrings.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'Room Number: ${selectedRoomNumberStrings.join(', ')}',
              style: AppTextStyles.bodySmall
                  .copyWith(color: const Color(0xFFA0A0A0)),
            ),
          ],
          const SizedBox(height: 8),
          _buildSummaryRow('Room Price', _currencyFormat.format(roomCharge)),
          const SizedBox(height: 8),
          _buildSummaryRow('Guests', '$adults Adults, $children Children'),

          if (totalExtraFee > 0) ...[
            const SizedBox(height: 8),
            _buildSummaryRow(
                'Children Extra Fee', _currencyFormat.format(totalExtraFee)),
          ],

          if (services.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'SELECTED SERVICES',
              style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 10,
                color: AppColors.primary.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 8),
            ...services.map((item) {
              if (item == null) return const SizedBox.shrink();
              final price =
                  double.tryParse(item['price']?.toString() ?? '0') ?? 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _buildSummaryRow('• ${item['name'] ?? 'Service'}',
                    _currencyFormat.format(price)),
              );
            }).toList(),
          ],
          const SizedBox(height: 8),
          _buildSummaryRow(
              'Service Fee & Taxes (10%)', _currencyFormat.format(tax)),

          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Divider(height: 1, color: AppColors.surfaceContainerHigh),
          ),
          _buildSummaryRow(
              'Total', _currencyFormat.format(totalBeforeDiscount)),
          if (discount > 0) ...[
            const SizedBox(height: 12),
            _buildSummaryRow(
                data['appliedVoucher'] != null &&
                        data['appliedVoucher']['discount_type'] == 'percentage'
                    ? 'Discount (${data['appliedVoucher']['discount_value']}%)'
                    : 'Discount',
                '-${_currencyFormat.format(discount)}',
                isDiscount: true),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Total Amount',
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    '${_currencyFormat.format(totalAmount)} VND',
                    style: AppTextStyles.h3.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSummaryCard(Map<String, dynamic> data) {
    final service = data['service'];
    final package = data['package'];
    final int qty = data['guests'] ?? 1;

    final double basePrice =
        double.tryParse(package['price']?.toString() ?? '0') ?? 0;
    final bool isFixedPriceType =
        service['type'] == 'Hall' || service['type'] == 'Event';

    final double itemPrice = isFixedPriceType ? basePrice : basePrice * qty;
    final double taxAmount = itemPrice * 0.1;
    final double discount =
        double.tryParse(data['discount']?.toString() ?? '0') ?? 0;
    final double subtotal = itemPrice + taxAmount;
    final double totalAmount = subtotal - discount;

    String qtyLabel = 'x$qty';
    if (service['type'] == 'Hall' || service['type'] == 'Event') {
      qtyLabel = '';
    } else if (service['type'] == 'Food') {
      qtyLabel = '($qty suất)';
    }
    final subLabel = '${service['name'] ?? 'Service'} $qtyLabel';

    return Container(
      padding: const EdgeInsets.all(24),
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
          const SizedBox(height: 24),
          const Divider(color: Color(0xFFF3F3F1)),
          const SizedBox(height: 24),
          _buildSummaryRow(subLabel, _currencyFormat.format(itemPrice)),
          const SizedBox(height: 12),
          _buildSummaryRow(
              'Thuế dịch vụ (10%)', _currencyFormat.format(taxAmount)),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Divider(height: 1, color: AppColors.surfaceContainerHigh),
          ),
          _buildSummaryRow('Total', _currencyFormat.format(subtotal)),
          if (discount > 0) ...[
            const SizedBox(height: 12),
            _buildSummaryRow(
                data['appliedVoucher'] != null &&
                        data['appliedVoucher']['discount_type'] == 'percentage'
                    ? 'Giảm giá (${data['appliedVoucher']['discount_value']}%)'
                    : 'Giảm giá',
                '-${_currencyFormat.format(discount)}',
                isDiscount: true),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Total Amount',
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    '${_currencyFormat.format(totalAmount)} VND',
                    style: AppTextStyles.h2.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value,
      {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: AppTextStyles.bodyMedium
                .copyWith(color: const Color(0xFF505050)),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: isDiscount ? Colors.red : const Color(0xFF1D2120),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentMethodItem({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required bool isComingSoon,
  }) {
    return GestureDetector(
      onTap: isComingSoon
          ? null
          : () {
              setState(() {
                _selectedMethod = id;
              });
            },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isComingSoon
              ? const Color(0xFFF3F3F1).withOpacity(0.5)
              : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF2D472B) : Colors.transparent,
            width: 1.5,
          ),
          boxShadow: [
            if (!isComingSoon)
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
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F3F1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF1D2120), size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isComingSoon
                          ? const Color(0xFFA0A0A0)
                          : const Color(0xFF1D2120),
                    ),
                  ),
                  Text(
                    isComingSoon ? 'Coming Soon' : subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFFA0A0A0),
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Color(0xFF2D472B))
            else if (isComingSoon)
              const SizedBox.shrink()
            else
              const Icon(Icons.arrow_forward_ios,
                  size: 14, color: Color(0xFFE0E0E0)),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomButton() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      color: const Color(0xFFFBFBF9),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 64,
            child: ElevatedButton(
              onPressed: _isProcessing
                  ? null
                  : () async {
                      setState(() => _isProcessing = true);
                      try {
                        // Calculate total amount again for safety
                        final data = widget.bookingData;
                        final bool isService = data.containsKey('service');
                        final bool isFixedPriceType = isService && (data['service']['type'] == 'Hall' || data['service']['type'] == 'Event');
                        double amount = 0;

                        if (isService) {
                          final package = data['package'];
                          final int qty = data['guests'] ?? 1;
                          final double basePrice = double.tryParse(
                                  package['price']?.toString() ?? '0') ??
                              0;
                          final double itemPrice =
                              isFixedPriceType ? basePrice : basePrice * qty;
                          final double taxAmount = itemPrice * 0.1;
                          final double discount = double.tryParse(
                                  data['discount']?.toString() ?? '0') ??
                              0;
                          amount = itemPrice + taxAmount - discount;
                        } else {
                          // Room calculation logic (simplified or extracted)
                          // For now, use total_amount passed from summary page if available
                          amount = double.tryParse(
                                  data['total_amount']?.toString() ?? '0') ??
                              0;
                        }

                        // Calculate nights for pricing breakdown
                        int calculatedNights = 1;
                        final checkIn = data['checkIn'] is DateTime
                            ? data['checkIn'] as DateTime?
                            : DateTime.tryParse(
                                data['checkIn']?.toString() ?? '');
                        final checkOut = data['checkOut'] is DateTime
                            ? data['checkOut'] as DateTime?
                            : DateTime.tryParse(
                                data['checkOut']?.toString() ?? '');
                        if (checkIn != null && checkOut != null) {
                          calculatedNights =
                              checkOut.difference(checkIn).inDays;
                          if (calculatedNights <= 0) calculatedNights = 1;
                        }

                        // Recalculate breakdown for DB sync
                        double totalExtraFee = 0;
                        if (!isService) {
                          final List<dynamic> childAges =
                              data['childAges'] ?? [];
                          int under6Count = 0;
                          for (var ageStr in childAges) {
                            if (ageStr == '< 6 years old') {
                              under6Count++;
                              if (under6Count > 2) totalExtraFee += 200000;
                            } else if (ageStr == '6 - 12 years old') {
                              totalExtraFee += 200000;
                            } else if (ageStr == '> 12 years old') {
                              totalExtraFee += 400000;
                            }
                          }
                          totalExtraFee *= calculatedNights;
                        }

                        final double basePrice = double.tryParse(
                                data['base_price']?.toString() ?? '0') ??
                            0;
                        final List<dynamic> selectedRoomNumberIds =
                            data['selectedRoomNumberIds'] ?? [];
                        final int roomCount = selectedRoomNumberIds.isEmpty
                            ? 1
                            : selectedRoomNumberIds.length;
                        final double roomCharge =
                            basePrice * calculatedNights * roomCount;
                        final double taxAmount = isService 
                            ? ((isFixedPriceType ? basePrice : basePrice * (data['guests'] ?? 1)) * 0.1)
                            : ((roomCharge + totalExtraFee) * 0.1);

                        // Call backend to create booking
                        final response = await ApiService.post(
                            '/payments/create',
                            _sanitizeMap({
                              ...data,
                              'userId': data['userId'] ?? _userId ?? 1,
                              'type': isService ? 'service' : 'room',
                              'adults': isService ? (data['guests'] ?? 1) : (data['adults'] ?? 1),
                              'totalAmount': amount,
                              'taxAmount': taxAmount,
                              'extraFee': totalExtraFee,
                              'discountAmount': double.tryParse(data['discount']?.toString() ?? '0') ?? 0,
                              'paymentMethod': _selectedMethod,
                              'voucherId': data['voucherId'] ?? data['appliedVoucher']?['id'],
                              'selectedServices': data['selectedServices'] ?? data['services'] ?? [],
                              'selectedRoomNumberIds': data['selectedRoomNumberIds'] ?? data['roomNumberIds'] ?? [],
                              'base_price': data['base_price'] ?? 0,
                            }));

                        if (response['success']) {
                          final result = response['data'];
                          if (mounted) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => QRPaymentPage(
                                  bookingData: {
                                    ...data,
                                    'type': isService ? 'service' : 'room',
                                    'taxAmount': taxAmount,
                                    'extraFee': totalExtraFee,
                                    'totalAmount': amount,
                                  },
                                  initialOrderCode: result['orderCode'],
                                  amount: amount,
                                  paymentId: result['paymentId'] ?? 0,
                                ),
                              ),
                            );
                          }
                        } else {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text(response['message'] ??
                                      'Failed to create booking')),
                            );
                          }
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: ${e.toString()}')),
                          );
                        }
                      } finally {
                        if (mounted) setState(() => _isProcessing = false);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2D472B),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(32)),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isProcessing)
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  else ...[
                    const Icon(Icons.verified_user_outlined, size: 18),
                    const SizedBox(width: 12),
                    Text(
                      'Pay Now',
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(color: Color(0xFFA0A0A0), fontSize: 10),
              children: [
                TextSpan(
                    text:
                        'By clicking "Pay Now", you agree to Thao Nguyen Resort\'s '),
                TextSpan(
                  text: 'Terms of Use',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _sanitizeMap(Map<String, dynamic> map) {
    final sanitized = <String, dynamic>{};
    map.forEach((key, value) {
      if (value is Map<String, dynamic>) {
        sanitized[key] = _sanitizeMap(value);
      } else if (value is List) {
        sanitized[key] = value
            .map((e) {
              if (e is Map<String, dynamic>) return _sanitizeMap(e);
              if (_isEncodable(e)) return e;
              return null;
            })
            .where((e) => e != null)
            .toList();
      } else if (_isEncodable(value)) {
        if (value is DateTime) {
          sanitized[key] = value.toIso8601String();
        } else {
          sanitized[key] = value;
        }
      }
    });
    return sanitized;
  }

  bool _isEncodable(dynamic value) {
    if (value == null ||
        value is String ||
        value is num ||
        value is bool ||
        value is Map ||
        value is List ||
        value is DateTime) {
      return true;
    }
    return false;
  }
}
