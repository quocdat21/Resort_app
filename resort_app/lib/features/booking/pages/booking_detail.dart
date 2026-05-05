import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/localization/app_strings.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/loading.dart';
import 'room_booking_detail.dart';
import 'service_booking_detail.dart';

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
      final response = await ApiService.get('/bookings/detail/${widget.bookingCode}');
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
    final data = _fetchedData ?? widget.bookingData;
    // Map<String, dynamic> is not strictly enforced here to avoid mismatch errors
    // but sub-components will handle specific casting

    if (data.isEmpty && _isLoadingBooking) {
      return const Scaffold(body: Center(child: Loading()));
    }

    if (data.isEmpty) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(AppStrings.get(context, 'no_booking_data'))),
      );
    }

    // Robust Type Detection
    final bool isRoomFromType = data['type'] == 'room';
    final bool isServiceFromType = data['type'] == 'service';
    final bool hasRoomData = data['room'] != null ||
        data['checkIn'] != null ||
        data['check_in'] != null;
    final bool isRoom = isRoomFromType || (hasRoomData && !isServiceFromType);

    return Scaffold(
      backgroundColor: const Color(0xFFFDFDF9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF2D4733)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          isRoom
              ? AppStrings.get(context, 'Chi tiết đặt phòng')
              : 'Chi tiết đặt dịch vụ',
          style: const TextStyle(
              color: Color(0xFF2D4733), fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          isRoom
              ? RoomBookingDetailPage(
                  data: data,
                  bookingCode: widget.bookingCode,
                  currentUserName: _currentUserName,
                  currentUserInitial: _currentUserInitial,
                  currentUserAvatar: _currentUserAvatar,
                  currencyFormat: _currencyFormat,
                )
              : ServiceBookingDetailPage(
                  data: data,
                  bookingCode: widget.bookingCode,
                  currentUserName: _currentUserName,
                  currentUserInitial: _currentUserInitial,
                  currentUserAvatar: _currentUserAvatar,
                  currencyFormat: _currencyFormat,
                ),
          if (_isLoadingBooking) const Loading(),
        ],
      ),
    );
  }
}
