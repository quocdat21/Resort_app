import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

class EditBookingPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const EditBookingPage({super.key, required this.bookingData});

  @override
  State<EditBookingPage> createState() => _EditBookingPageState();
}

class _EditBookingPageState extends State<EditBookingPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _rangeStart;
  DateTime? _rangeEnd;

  int _adults = 1;
  int _children = 0;
  List<String> _childAges = [];

  int _basePrice = 0;
  int _capacityAdults = 2;
  int _capacityChildren = 0;

  @override
  void initState() {
    super.initState();
    _adults = widget.bookingData['adults'] ?? 1;
    _children = widget.bookingData['children'] ?? 0;

    final now = DateTime.now();
    DateTime firstSelectableDay = DateTime(now.year, now.month, now.day);
    if (now.hour >= 14) {
      firstSelectableDay = firstSelectableDay.add(const Duration(days: 1));
    }

    final String? checkInStr = widget.bookingData['checkIn'];
    final String? checkOutStr = widget.bookingData['checkOut'];
    if (checkInStr != null && checkOutStr != null) {
      try {
        DateTime checkIn = DateFormat('yyyy-MM-dd').parse(checkInStr);
        DateTime checkOut = DateFormat('yyyy-MM-dd').parse(checkOutStr);
        
        // If the current booking start is before the first selectable day (e.g. today but it's past 14h)
        // We push it to the first selectable day
        if (checkIn.isBefore(firstSelectableDay)) {
          checkIn = firstSelectableDay;
          // Ensure checkOut is at least 1 day after checkIn
          if (!checkOut.isAfter(checkIn)) {
            checkOut = checkIn.add(const Duration(days: 1));
          }
        }
        
        _rangeStart = checkIn;
        _rangeEnd = checkOut;
        _focusedDay = _rangeStart ?? firstSelectableDay;
      } catch (e) {
        _focusedDay = firstSelectableDay;
      }
    } else {
      _focusedDay = firstSelectableDay;
    }

    // Attempt to load child ages if provided, otherwise default to < 6 years old
    final dynamic providedAges = widget.bookingData['childAges'];
    if (providedAges is List) {
      _childAges = List<String>.from(providedAges);
    } else {
      _childAges = List.generate(_children, (_) => '< 6 years old');
    }

    _basePrice = (widget.bookingData['base_price'] is int)
        ? widget.bookingData['base_price']
        : int.tryParse(widget.bookingData['base_price']?.toString() ?? '0') ??
            0;

    _capacityAdults = widget.bookingData['capacity_adults'] ?? 2;
    _capacityChildren = widget.bookingData['capacity_children'] ?? 0;
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
          'Edit Booking',
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCurrentReservationCard(),
            const SizedBox(height: 32),
            _buildSectionLabel('SELECT DATES'),
            const SizedBox(height: 16),
            _buildDateDisplay(),
            const SizedBox(height: 16),
            _buildCalendar(),
            const SizedBox(height: 32),
            _buildTotalSummary(),
            const SizedBox(height: 40),
            _buildUpdateActionButton(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: AppTextStyles.labelSmall.copyWith(
        color: AppColors.secondary,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildCurrentReservationCard() {
    final String? imageUrl = widget.bookingData['main_image_url'];
    final String name = widget.bookingData['name'] ?? 'Room';

    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: AppColors.surfaceContainerHigh,
        image: imageUrl != null
            ? DecorationImage(
                image: NetworkImage(imageUrl),
                fit: BoxFit.cover,
              )
            : null,
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
                  'CURRENT RESERVATION',
                  style: AppTextStyles.labelSmall
                      .copyWith(color: Colors.white70, fontSize: 10),
                ),
                const SizedBox(height: 4),
                Text(
                  name,
                  style: AppTextStyles.h3.copyWith(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateDisplay() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Row(
        children: [
          Expanded(child: _dateItem('CHECK-IN', _rangeStart)),
          Container(
              width: 1, height: 40, color: AppColors.surfaceContainerHigh),
          Expanded(child: _dateItem('CHECK-OUT', _rangeEnd)),
        ],
      ),
    );
  }

  Widget _dateItem(String label, DateTime? date) {
    return Column(
      children: [
        Text(
          label,
          style: AppTextStyles.labelSmall
              .copyWith(fontSize: 10, color: AppColors.outline),
        ),
        const SizedBox(height: 4),
        Text(
          date != null ? DateFormat('MMM dd, yyyy').format(date) : 'Select',
          style: AppTextStyles.bodyMedium
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildCalendar() {
    final now = DateTime.now();
    DateTime firstSelectableDay = DateTime(now.year, now.month, now.day);
    if (now.hour >= 14) {
      firstSelectableDay = firstSelectableDay.add(const Duration(days: 1));
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 20,
              offset: const Offset(0, 10)),
        ],
      ),
      child: TableCalendar(
        firstDay: firstSelectableDay,
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: _focusedDay.isBefore(firstSelectableDay) ? firstSelectableDay : _focusedDay,
        rangeStartDay: _rangeStart,
        rangeEndDay: _rangeEnd,
        rangeSelectionMode: RangeSelectionMode.enforced,
        onRangeSelected: (start, end, focusedDay) {
          setState(() {
            _rangeStart = start;
            _rangeEnd = end;
            _focusedDay = focusedDay;
          });
        },
        headerStyle: const HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
          titleTextStyle: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: AppColors.primary),
        ),
        calendarStyle: CalendarStyle(
          rangeHighlightColor: AppColors.primary.withOpacity(0.1),
          rangeStartDecoration: const BoxDecoration(
              color: AppColors.primary, shape: BoxShape.circle),
          rangeEndDecoration: const BoxDecoration(
              color: AppColors.primary, shape: BoxShape.circle),
          withinRangeTextStyle: const TextStyle(
              color: AppColors.primary, fontWeight: FontWeight.bold),
          todayDecoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              shape: BoxShape.circle),
          todayTextStyle: const TextStyle(
              color: AppColors.primary, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }


  Widget _buildTotalSummary() {
    int nights = 0;
    if (_rangeStart != null && _rangeEnd != null) {
      nights = _rangeEnd!.difference(_rangeStart!).inDays;
    }

    int subtotal = _basePrice * (nights > 0 ? nights : 0);

    int extraFeePerNight = 0;
    int under6Count = 0;
    final List<dynamic> selectedRooms = widget.bookingData['selectedRoomNumberIds'] ?? [];
    int roomCount = selectedRooms.length > 0 ? selectedRooms.length : 1;
    int freeUnder6Limit = roomCount * 2;

    for (String ageStr in _childAges) {
      if (ageStr == '< 6 years old') {
        under6Count++;
        if (under6Count > freeUnder6Limit) {
          extraFeePerNight += 200000;
        }
      } else if (ageStr == '6 - 12 years old') {
        extraFeePerNight += 200000;
      } else if (ageStr == '> 12 years old') {
        extraFeePerNight += 400000;
      }
    }

    int totalExtraFee = extraFeePerNight * (nights > 0 ? nights : 1);
    subtotal += totalExtraFee;

    int tax = (subtotal * 0.1).round();
    int total = subtotal + tax;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Room Charge${nights > 0 ? ' ($nights nights)' : ''}',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.outline)),
              Text(
                  '${NumberFormat('#,###').format(_basePrice * (nights > 0 ? nights : 0))} VND',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.outline)),
            ],
          ),
          if (totalExtraFee > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text('Children Extra Fee',
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.outline)),
                ),
                Text('${NumberFormat('#,###').format(totalExtraFee)} VND',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.outline)),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text('Taxes & Fees (10%)',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.outline)),
              ),
              Text('${NumberFormat('#,###').format(tax)} VND',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.outline)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text('Total',
                    style: AppTextStyles.h3.copyWith(
                        fontWeight: FontWeight.bold, color: AppColors.primary)),
              ),
              const SizedBox(width: 8),
              Text(
                  nights > 0
                      ? '${NumberFormat('#,###').format(total)} VND'
                      : '-',
                  style: AppTextStyles.h2.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 12),
          Text('*Children extra fee includes breakfast.',
              style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.outline,
                  fontStyle: FontStyle.italic,
                  fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildUpdateActionButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: () {
          if (_rangeStart == null || _rangeEnd == null) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Vui lòng chọn ngày Check-in, Check-out!'),
                backgroundColor: AppColors.error));
            return;
          }
          final updatedSearchData = {
            'checkIn': DateFormat('yyyy-MM-dd').format(_rangeStart!),
            'checkOut': DateFormat('yyyy-MM-dd').format(_rangeEnd!),
            'adults': _adults,
            'children': _children,
            'childAges': _childAges,
          };
          Navigator.pop(context, updatedSearchData);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          elevation: 8,
        ),
        child: Text(
          'Update Booking',
          style: AppTextStyles.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 1.1,
          ),
        ),
      ),
    );
  }
}
