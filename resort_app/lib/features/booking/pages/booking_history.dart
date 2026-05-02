import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import 'booking_detail.dart';

class BookingHistoryPage extends StatefulWidget {
  const BookingHistoryPage({super.key});

  @override
  State<BookingHistoryPage> createState() => _BookingHistoryPageState();
}

class _BookingHistoryPageState extends State<BookingHistoryPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _allBookings = [];
  bool _isLoading = true;
  String? _error;

  final NumberFormat _currencyFormat = NumberFormat('#,###', 'vi_VN');

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user_data');
      if (userJson == null) {
        setState(() {
          _error = AppStrings.get(context, 'login_to_view_history');
          _isLoading = false;
        });
        return;
      }

      final userData = json.decode(userJson);
      final userId = userData['id'];

      final response = await ApiService.get('/bookings/user/$userId');

      if (response['success']) {
        setState(() {
          _allBookings = response['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = response['message'] ?? AppStrings.get(context, 'failed_load_bookings');
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = AppStrings.get(context, 'error_occurred');
        _isLoading = false;
      });
      debugPrint('Error loading bookings: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDFDF9),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          AppStrings.get(context, 'my_bookings'),
          style: AppTextStyles.h3.copyWith(
            color: const Color(0xFF2D4733),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelStyle: AppTextStyles.labelSmall.copyWith(fontWeight: FontWeight.bold),
          tabs: [
            Tab(text: AppStrings.get(context, 'all')),
            Tab(text: AppStrings.get(context, 'pending')),
            Tab(text: AppStrings.get(context, 'confirmed')),
            Tab(text: AppStrings.get(context, 'completed')),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorState()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBookingList(_allBookings),
                    _buildBookingList(_allBookings
                        .where((b) => b['status'] == 'Pending')
                        .toList()),
                    _buildBookingList(_allBookings
                        .where((b) => b['status'] == 'Confirmed')
                        .toList()),
                    _buildBookingList(_allBookings
                        .where((b) => b['status'] == 'Completed' || b['status'] == 'Cancelled')
                        .toList()),
                  ],
                ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(_error!, style: AppTextStyles.bodyMedium.copyWith(color: Colors.grey)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loadBookings,
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: Text(AppStrings.get(context, 'retry'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingList(List<dynamic> bookings) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey.shade200),
            const SizedBox(height: 16),
            Text(AppStrings.get(context, 'no_bookings_found'), style: AppTextStyles.bodyMedium.copyWith(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: bookings.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final booking = bookings[index];
        return _buildBookingCard(booking);
      },
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    final status = booking['status'] ?? 'Pending';
    final type = booking['type'] ?? 'room';
    final itemName = booking['item_name'] ?? (type == 'room' ? 'Resort Room' : 'Resort Service');
    final imageUrl = booking['image_url'];
    final amount = double.tryParse(booking['total_amount']?.toString() ?? '0') ?? 0;
    
    // Format dates
    String dateRange = '';
    if (type == 'room') {
      final checkIn = booking['check_in'] != null ? DateFormat('MMM d').format(DateTime.parse(booking['check_in'])) : 'N/A';
      final checkOut = booking['check_out'] != null ? DateFormat('MMM d, yyyy').format(DateTime.parse(booking['check_out'])) : 'N/A';
      dateRange = '$checkIn - $checkOut';
    } else {
      dateRange = booking['service_booking_date'] != null 
          ? DateFormat('MMM d, yyyy').format(DateTime.parse(booking['service_booking_date']))
          : 'N/A';
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BookingDetailPage(
              bookingData: booking,
              bookingCode: booking['booking_code'] ?? 'N/A',
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            children: [
              Row(
                children: [
                  // Image
                  Container(
                    width: 100,
                    height: 100,
                    margin: const EdgeInsets.all(12),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: imageUrl != null
                          ? Image.network(ApiService.fixImageUrl(imageUrl), fit: BoxFit.cover)
                          : Container(color: Colors.grey.shade100, child: const Icon(Icons.image, color: Colors.grey)),
                    ),
                  ),
                  // Info
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildStatusBadge(status),
                              Text(
                                '#${booking['booking_code'] ?? ''}',
                                style: AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade400, fontSize: 10),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            itemName,
                            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.calendar_month, size: 14, color: AppColors.primary),
                              const SizedBox(width: 4),
                              Text(dateRange, style: AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade600)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(height: 1, color: Color(0xFFF3F3F1)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total Price',
                      style: AppTextStyles.bodySmall.copyWith(color: Colors.grey),
                    ),
                    Text(
                      '${_currencyFormat.format(amount)} VND',
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'Confirmed':
        color = Colors.green;
        break;
      case 'Pending':
        color = Colors.orange;
        break;
      case 'Cancelled':
        color = Colors.red;
        break;
      case 'Completed':
        color = AppColors.primary;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.toUpperCase(),
        style: AppTextStyles.labelSmall.copyWith(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
