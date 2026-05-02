import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'payment_confirm.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:http/http.dart' as http;
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:typed_data';

class QRPaymentPage extends StatefulWidget {
  final Map<String, dynamic> bookingData;
  final String initialOrderCode;
  final double amount;
  final int paymentId;

  const QRPaymentPage({
    super.key,
    required this.bookingData,
    required this.initialOrderCode,
    required this.amount,
    required this.paymentId,
  });

  @override
  State<QRPaymentPage> createState() => _QRPaymentPageState();
}

class _QRPaymentPageState extends State<QRPaymentPage> {
  late String _currentOrderCode;
  late int _secondsRemaining;
  Timer? _timer;
  Timer? _statusPollingTimer;
  bool _isExpiring = false;
  final NumberFormat _currencyFormat = NumberFormat('#,###', 'vi_VN');

  @override
  void initState() {
    super.initState();
    _currentOrderCode = widget.initialOrderCode;
    _secondsRemaining = 300; // 5 minutes
    _startTimer();
    _startStatusPolling();
  }

  void _startStatusPolling() {
    _statusPollingTimer =
        Timer.periodic(const Duration(seconds: 4), (timer) async {
      try {
        final response =
            await ApiService.get('/payments/status/${widget.paymentId}');
        if (response['success'] && response['status'] == 'success') {
          timer.cancel();
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => PaymentConfirmPage(
                  bookingData: widget.bookingData,
                  reservationId: _currentOrderCode,
                ),
              ),
            );
          }
        }
      } catch (e) {
        debugPrint('Error polling payment status: $e');
      }
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        timer.cancel();
        _handleExpiration();
      }
    });
  }

  Future<void> _handleExpiration() async {
    if (_isExpiring) return;
    setState(() => _isExpiring = true);

    try {
      await ApiService.post('/payments/expire', {
        'paymentId': widget.paymentId,
      });

      if (mounted) {
        _showExpirationDialog();
      }
    } catch (e) {
      if (mounted) _showExpirationDialog();
    }
  }

  void _showExpirationDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.timer_off_outlined, color: Colors.red),
            const SizedBox(width: 10),
            Text('Hết hạn thanh toán',
                style: AppTextStyles.h3.copyWith(color: Colors.red)),
          ],
        ),
        content: const Text(
          'Thời gian thanh toán đã hết. Đơn đặt phòng của quý khách đã bị hủy tự động.',
          style: AppTextStyles.bodyMedium,
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('QUAY VỀ TRANG CHỦ',
                  style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  void _showCancelConfirmationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Xác nhận hủy', style: AppTextStyles.h3),
        content: Text(
          'Bạn có chắc chắn muốn hủy đơn đặt phòng này không?',
          style: AppTextStyles.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('QUAY LẠI',
                style: AppTextStyles.bodyMedium.copyWith(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _handleManualCancel();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('HỦY ĐẶT PHÒNG',
                style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _handleManualCancel() async {
    setState(() => _isExpiring = true);
    try {
      await ApiService.post('/payments/expire', {
        'paymentId': widget.paymentId,
      });
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi khi hủy đơn hàng.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isExpiring = false);
    }
  }

  String _getFormattedTime() {
    final minutes = (_secondsRemaining / 60).floor();
    final seconds = _secondsRemaining % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String _getQrUrl() {
    return 'https://qr.sepay.vn/img?acc=703713939&bank=MBBank&amount=${widget.amount.toInt()}&des=$_currentOrderCode';
  }

  Future<void> _saveQrToGallery() async {
    try {
      // Request permission
      final status = await Permission.photos.request();
      if (status.isGranted || status.isLimited) {
        // Download image
        final response = await http.get(Uri.parse(_getQrUrl()));
        if (response.statusCode == 200) {
          final result = await ImageGallerySaver.saveImage(
            Uint8List.fromList(response.bodyBytes),
            quality: 100,
            name: "QR_Payment_${_currentOrderCode}",
          );
          
          if (mounted) {
            if (result['isSuccess']) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đã lưu mã QR vào thư viện ảnh'),
                  backgroundColor: Colors.green,
                ),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Không thể lưu ảnh vào thư viện'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        }
      } else if (status.isPermanentlyDenied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vui lòng cấp quyền truy cập ảnh trong cài đặt'),
              backgroundColor: Colors.orange,
            ),
          );
          openAppSettings();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _statusPollingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: Text(
            'Thanh toán QR',
            style: AppTextStyles.h3.copyWith(fontWeight: FontWeight.bold),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              children: [
                const SizedBox(height: 8),
                Text(
                  'Thao Nguyen Resort',
                  style: AppTextStyles.h2.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),

                // QR Container Card
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                        color: AppColors.surfaceContainerHigh, width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          ApiService.fixImageUrl(_getQrUrl()),
                          height: 240,
                          width: 240,
                          fit: BoxFit.contain,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const SizedBox(
                              height: 240,
                              width: 240,
                              child: Center(
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2)),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Amount Display (Reduced Size)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 10, horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Text(
                              'SỐ TIỀN CẦN THANH TOÁN',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.primary.withOpacity(0.6),
                                fontWeight: FontWeight.bold,
                                fontSize: 9, // Slightly smaller label
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${_currencyFormat.format(widget.amount)} VND',
                              style: AppTextStyles.h3.copyWith(
                                // Changed h1 -> h3
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Payment Content One-Liner (Reduced Size, No Copy)
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 12),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade100),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Nội dung chuyển khoản: ',
                                style: AppTextStyles.bodySmall
                                    .copyWith(color: Colors.grey.shade600),
                              ),
                              Text(
                                _currentOrderCode,
                                style: AppTextStyles.bodySmall.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Countdown Timer
                Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.timer_outlined,
                          size: 14, color: Colors.red),
                      const SizedBox(width: 8),
                      Text(
                        'Hết hạn sau: ',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: Colors.red.shade800, fontSize: 11),
                      ),
                      Text(
                        _getFormattedTime(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.red.shade900,
                          fontWeight: FontWeight.w900,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Instructions Box
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline_rounded,
                          color: Colors.amber.shade900, size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Vui lòng KHÔNG sửa nội dung để hệ thống tự động xác nhận đơn hàng của bạn.',
                          style: AppTextStyles.bodySmall.copyWith(
                            // Using bodySmall
                            color: Colors.black87,
                            height: 1.4,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Actions
                if (_isExpiring)
                  const CircularProgressIndicator()
                else ...[
                  SizedBox(
                    width: double.infinity,
                    height: 58,
                    child: ElevatedButton.icon(
                      onPressed: _saveQrToGallery,
                      icon: const Icon(Icons.save_alt_rounded),
                      label: const Text('LƯU MÃ QR'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18)),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _showCancelConfirmationDialog,
                    child: Text(
                      'HỦY ĐẶT PHÒNG',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
