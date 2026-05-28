import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import '../../booking/pages/booking_detail.dart';
import '../../../core/widgets/loading.dart';

class PaymentHistoryPage extends StatefulWidget {
  const PaymentHistoryPage({super.key});

  @override
  State<PaymentHistoryPage> createState() => _PaymentHistoryPageState();
}

class _PaymentHistoryPageState extends State<PaymentHistoryPage> {
  bool _isLoading = true;
  double _totalSpent = 0;
  List<dynamic> _payments = [];
  String _activeFilter = 'all_payments';

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final user = await ApiService.getUser();
      if (user == null) return;

      final userId = user['id'];
      final res = await ApiService.get('/payments/history/$userId');

      if (res['success'] == true) {
        setState(() {
          _payments = res['data']['payments'] ?? [];
          _totalSpent =
              double.tryParse(res['data']['totalSpent']?.toString() ?? '0') ??
                  0.0;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error loading payment history: $e');
      setState(() => _isLoading = false);
    }
  }

  List<dynamic> _getFilteredPayments() {
    if (_activeFilter == 'all_payments') return _payments;
    if (_activeFilter == 'last_30_days') {
      final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
      return _payments.where((p) {
        final date = DateTime.tryParse(p['created_at'] ?? '') ?? DateTime.now();
        return date.isAfter(thirtyDaysAgo);
      }).toList();
    }
    if (_activeFilter == 'refunds') {
      return _payments.where((p) => p['status'] == 'refunded').toList();
    }
    return _payments;
  }

  Map<String, List<dynamic>> _groupPaymentsByMonth(List<dynamic> payments) {
    final Map<String, List<dynamic>> groups = {};
    for (var p in payments) {
      final date = DateTime.tryParse(p['created_at'] ?? '') ?? DateTime.now();
      final locale = Localizations.localeOf(context).languageCode;
      final monthStr = DateFormat.yMMMM(locale).format(date).toUpperCase();
      if (!groups.containsKey(monthStr)) {
        groups[monthStr] = [];
      }
      groups[monthStr]!.add(p);
    }
    return groups;
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _getFilteredPayments();
    final grouped = _groupPaymentsByMonth(filtered);
    final currencyFormat =
        NumberFormat.currency(locale: 'vi_VN', symbol: 'VND', decimalDigits: 0);

    return Scaffold(
      backgroundColor: AppColors.onPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.get(context, 'payment_history'),
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _loadHistory,
            color: AppColors.primary,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  Text(
                    AppStrings.get(context, 'portfolio_overview'),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Colors.grey.shade400,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        currencyFormat.format(_totalSpent),
                        style: AppTextStyles.h2.copyWith(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        AppStrings.get(context, 'total_spent'),
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: Colors.grey.shade400),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Filters
                  Row(
                    children: [
                      _buildFilterTab('all_payments'),
                      const SizedBox(width: 12),
                      _buildFilterTab('last_30_days'),
                      const SizedBox(width: 12),
                      _buildFilterTab('refunds'),
                    ],
                  ),

                  const SizedBox(height: 32),

                  if (filtered.isEmpty && !_isLoading)
                    Center(
                      child: Column(
                        children: [
                          const SizedBox(height: 60),
                          Icon(Icons.payment_outlined,
                              size: 64, color: Colors.grey.shade200),
                          const SizedBox(height: 16),
                          Text(
                            AppStrings.get(context, 'no_transactions_found'),
                            style: AppTextStyles.bodyLarge
                                .copyWith(color: Colors.grey.shade400),
                          ),
                        ],
                      ),
                    )
                  else
                    ...grouped.entries.map((entry) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.key,
                            style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.grey.shade400,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 16),
                          ...entry.value.map((p) => _buildPaymentCard(p)),
                          const SizedBox(height: 24),
                        ],
                      );
                    }),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          if (_isLoading) const Loading(),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String filterKey) {
    final isActive = _activeFilter == filterKey;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = filterKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFDCC19F) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          AppStrings.get(context, filterKey),
          style: AppTextStyles.labelSmall.copyWith(
            color: isActive ? Colors.white : Colors.grey.shade600,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentCard(dynamic p) {
    final String type = p['booking_type'] ?? 'room';
    final String status = (p['status'] ?? 'pending').toUpperCase();
    final double amount =
        double.tryParse(p['amount']?.toString() ?? '0') ?? 0.0;
    final DateTime date =
        DateTime.tryParse(p['created_at'] ?? '') ?? DateTime.now();
    final locale = Localizations.localeOf(context).languageCode;
    final String dateStr = locale == 'vi'
        ? DateFormat('dd/MM/yyyy, HH:mm').format(date)
        : DateFormat('MMM dd, hh:mm a').format(date).toUpperCase();
    final String itemName = p['item_name'] ??
        (type == 'room'
            ? AppStrings.get(context, 'accommodation')
            : AppStrings.get(context, 'services'));
    final String ref = p['booking_code'] ?? 'REF-UNKNOWN';

    Color statusColor = Colors.green;
    if (status == 'PENDING') statusColor = Colors.orange;
    if (status == 'FAILED' || status == 'CANCELLED')
      statusColor = AppColors.error;
    if (status == 'REFUNDED') statusColor = Colors.blue;

    IconData icon = Icons.hotel_outlined;
    Color iconColor = const Color(0xFF1B3120);
    Color iconBg = const Color(0xFFE8F0E9);

    if (type == 'service') {
      icon = Icons.restaurant_outlined;
      iconColor = const Color(0xFF9E7E62);
      iconBg = const Color(0xFFF5F0EA);
    }

    if (status == 'REFUNDED') {
      icon = Icons.reply_rounded;
      iconColor = const Color(0xFFE57373);
      iconBg = const Color(0xFFFFEBEE);
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BookingDetailPage(bookingCode: ref),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
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
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: iconBg,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    itemName,
                    style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Ref: $ref',
                    style: AppTextStyles.labelSmall
                        .copyWith(color: Colors.grey.shade400, fontSize: 10),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dateStr,
                    style: AppTextStyles.bodySmall
                        .copyWith(color: Colors.grey.shade400, fontSize: 10),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${NumberFormat('#,###').format(amount)} VND',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: status == 'REFUNDED'
                        ? Colors.grey.shade400
                        : AppColors.primary,
                    decoration: status == 'REFUNDED'
                        ? TextDecoration.lineThrough
                        : null,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    _getLocalizedStatus(context, status),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: statusColor,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
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

  String _getLocalizedStatus(BuildContext context, String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppStrings.get(context, 'paid_status');
      case 'refunded':
        return AppStrings.get(context, 'refunded_status');
      case 'pending':
        return AppStrings.get(context, 'pending').toUpperCase();
      case 'failed':
        return AppStrings.get(context, 'failed_status');
      case 'cancelled':
        return AppStrings.get(context, 'cancelled').toUpperCase();
      default:
        return status;
    }
  }
}
