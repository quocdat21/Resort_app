import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:intl/intl.dart';
import 'package:resort_app/features/room/pages/room_booking_summary_page.dart';

class SelectServicesPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const SelectServicesPage({super.key, required this.bookingData});

  @override
  State<SelectServicesPage> createState() => _SelectServicesPageState();
}

class _SelectServicesPageState extends State<SelectServicesPage> {
  final List<Map<String, dynamic>> _services = [
    {
      'id': 1,
      'name': 'Dining Experience',
      'description': 'Local cuisine, Moc Chau specialties',
      'price': 150000,
      'unit': 'person',
      'icon': Icons.restaurant,
      'type': 'counter',
      'value': 1,
    },
    {
      'id': 2,
      'name': 'Campfire Experience',
      'description': 'Music, traditional wine, grilled snacks',
      'price': 1900000,
      'unit': 'VND',
      'icon': Icons.local_fire_department,
      'type': 'switch',
      'value': false,
    },
    {
      'id': 3,
      'name': 'Ethnic Performance',
      'description': 'MC and local performance team',
      'price': 3000000,
      'unit': 'VND',
      'icon': Icons.theater_comedy,
      'type': 'switch',
      'value': false,
    },
    {
      'id': 4,
      'name': 'Sound System',
      'description': 'Professional audio equipment',
      'price': 1000000,
      'unit': 'VND',
      'icon': Icons.speaker,
      'type': 'switch',
      'value': false,
    },
    {
      'id': 5,
      'name': 'Tea Break',
      'description': 'Premium local tea and snacks',
      'price': 40000,
      'unit': 'person',
      'icon': Icons.local_cafe,
      'type': 'counter',
      'value': 0,
    },
    {
      'id': 6,
      'name': 'Fresh Flowers',
      'description': 'Hand-picked local flower basket',
      'price': 80000,
      'unit': 'basket',
      'icon': Icons.local_florist,
      'type': 'counter',
      'value': 0,
    },
  ];

  double _totalServices = 150000;
  double _roomPrice = 840000;

  void _updateServiceValue(int index, dynamic newValue) {
    setState(() {
      _services[index]['value'] = newValue;
      _calculateTotal();
    });
  }

  void _calculateTotal() {
    double total = 0;
    for (var service in _services) {
      if (service['type'] == 'counter') {
        total += (service['price'] as int) * (service['value'] as int);
      } else if (service['type'] == 'switch' && service['value'] == true) {
        total += (service['price'] as int);
      }
    }
    _totalServices = total;
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
          'Select Services',
          style: AppTextStyles.h3
              .copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                _buildRoomSummaryCard(),
                const SizedBox(height: 24),
                ..._services
                    .asMap()
                    .entries
                    .map((entry) => _buildServiceCard(entry.key, entry.value)),
                const SizedBox(height: 24),
                _buildBookingSummary(),
                const SizedBox(height: 120),
              ],
            ),
          ),
          _buildBottomActionBar(),
        ],
      ),
    );
  }

  Widget _buildRoomSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceContainerHigh),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.asset(
              'assets/images/image_onboarding2.jpg',
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Heritage Mountain Suite',
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 14, color: AppColors.outline),
                    const SizedBox(width: 4),
                    Text('Nov 12 - Nov 14',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.outline)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.person_outline,
                        size: 14, color: AppColors.outline),
                    const SizedBox(width: 4),
                    Text('2 Adults',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.outline)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(int index, Map<String, dynamic> service) {
    final bool isActive = service['type'] == 'counter'
        ? (service['value'] as int) > 0
        : (service['value'] as bool);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
            color:
                isActive ? AppColors.surfaceContainerHigh : Colors.transparent),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(service['icon'] as IconData,
                color: AppColors.secondary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service['name'] as String,
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  service['description'] as String,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.outline),
                ),
                const SizedBox(height: 8),
                Text(
                  'From ${NumberFormat('#,###').format(service['price'])} VND / ${service['unit']}',
                  style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.secondary),
                ),
              ],
            ),
          ),
          if (service['type'] == 'counter')
            _buildCounter(index, service['value'] as int)
          else
            Switch(
              value: service['value'] as bool,
              onChanged: (val) => _updateServiceValue(index, val),
              activeColor: AppColors.primary,
            ),
        ],
      ),
    );
  }

  Widget _buildCounter(int index, int value) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          _counterBtn(Icons.remove, () {
            if (value > 0) _updateServiceValue(index, value - 1);
          }),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(value.toString(),
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold)),
          ),
          _counterBtn(Icons.add, () => _updateServiceValue(index, value + 1),
              isPrimary: true),
        ],
      ),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap,
      {bool isPrimary = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isPrimary ? AppColors.primary : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(icon,
            size: 16, color: isPrimary ? Colors.white : AppColors.primary),
      ),
    );
  }

  Widget _buildBookingSummary() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Text(
            'Booking Summary',
            style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          _summaryRow('Room Price (2 nights)',
              '${NumberFormat('#,###').format(_roomPrice)} VND'),
          const SizedBox(height: 12),
          _summaryRow('Services Total',
              '${NumberFormat('#,###').format(_totalServices)} VND'),
          const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Price',
                  style: AppTextStyles.h3.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary)),
              Text(
                  '${NumberFormat('#,###').format(_roomPrice + _totalServices)} VND',
                  style: AppTextStyles.h2.copyWith(
                      fontWeight: FontWeight.bold, color: AppColors.primary)),
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
        Text(label,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.outline)),
        Text(value,
            style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primary, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBottomActionBar() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        decoration: BoxDecoration(
          color: AppColors.background,
          border:
              Border(top: BorderSide(color: AppColors.surfaceContainerHigh)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('FINAL AMOUNT',
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9,
                        color: AppColors.outline,
                        fontWeight: FontWeight.bold)),
                Text(
                  '${NumberFormat('#,###').format(_roomPrice + _totalServices)} VND',
                  style: AppTextStyles.h3.copyWith(
                      color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(
              height: 56,
              width: 180,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          BookingSummaryPage(bookingData: widget.bookingData),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28)),
                  elevation: 8,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Continue',
                        style: AppTextStyles.bodyLarge
                            .copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward, size: 18),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
