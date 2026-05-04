import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class Step1Form extends StatefulWidget {
  final TextEditingController fullNameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final VoidCallback onNext;
  final VoidCallback onLoginTap;

  const Step1Form({
    super.key,
    required this.fullNameController,
    required this.emailController,
    required this.phoneController,
    required this.onNext,
    required this.onLoginTap,
  });

  @override
  State<Step1Form> createState() => _Step1FormState();
}

class _Step1FormState extends State<Step1Form> {
  // Error messages
  String? _fullNameError;
  String? _emailError;
  String? _phoneError;

  // Regex cho tên tiếng Việt: cho phép chữ cái Unicode, dấu cách, dấu gạch ngang
  final RegExp _nameRegex = RegExp(r'^[\p{L}\s\-]{2,100}$', unicode: true);

  // Regex cho email
  final RegExp _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  // Regex cho SĐT Việt Nam
  final RegExp _phoneRegex = RegExp(r'^(0|\+84)[0-9]{9}$');

  InputDecoration _inputStyle(String hint, {String? errorText}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.outlineVariant,
        fontSize: 16,
      ),
      filled: true,
      fillColor: AppColors.surfaceContainerHigh.withOpacity(0.5),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: errorText != null
            ? const BorderSide(color: AppColors.error, width: 1.0)
            : BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: errorText != null ? AppColors.error : AppColors.primary,
          width: 1.5,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(
        vertical: 20,
        horizontal: 16,
      ),
      errorText: errorText,
      errorStyle: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.error,
        fontSize: 12,
      ),
      errorMaxLines: 2,
    );
  }

  bool _validate() {
    bool isValid = true;
    setState(() {
      // Validate Full Name
      final name = widget.fullNameController.text.trim();
      if (name.isEmpty) {
        _fullNameError = AppStrings.get(context, 'register_error_name_empty');
        isValid = false;
      } else if (!_nameRegex.hasMatch(name)) {
        _fullNameError = AppStrings.get(context, 'register_error_name_invalid');
        isValid = false;
      } else {
        _fullNameError = null;
      }

      // Validate Email
      final email = widget.emailController.text.trim();
      if (email.isEmpty) {
        _emailError = AppStrings.get(context, 'register_error_email_empty');
        isValid = false;
      } else if (!_emailRegex.hasMatch(email)) {
        _emailError = AppStrings.get(context, 'register_error_email_invalid');
        isValid = false;
      } else {
        _emailError = null;
      }

      // Validate Phone
      final phone = widget.phoneController.text.trim();
      if (phone.isEmpty) {
        _phoneError = AppStrings.get(context, 'register_error_phone_empty');
        isValid = false;
      } else if (!_phoneRegex.hasMatch(phone)) {
        _phoneError = AppStrings.get(context, 'register_error_phone_invalid');
        isValid = false;
      } else {
        _phoneError = null;
      }
    });
    return isValid;
  }

  void _handleNext() {
    if (_validate()) {
      widget.onNext();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.get(context, 'create_account'),
            style: const TextStyle(
              fontFamily: AppTextStyles.fontFamily,
              fontSize: 48,
              fontWeight: FontWeight.w900,
              color: AppColors.primary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            AppStrings.get(context, 'register_subtitle'),
            style: AppTextStyles.bodyLarge,
          ),
          const SizedBox(height: 40),

          // Full Name
          AppLabel(text: AppStrings.get(context, 'full_name_label')),
          TextField(
            controller: widget.fullNameController,
            autofocus: true,
            // Dùng TextInputType.text để tránh xung đột với bộ gõ tiếng Việt
            keyboardType: TextInputType.text,
            enableIMEPersonalizedLearning: true,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration:
                _inputStyle(AppStrings.get(context, 'full_name_hint'), errorText: _fullNameError),
            onChanged: (_) {
              if (_fullNameError != null) {
                setState(() => _fullNameError = null);
              }
            },
          ),
          const SizedBox(height: 24),

          // Email
          AppLabel(text: AppStrings.get(context, 'email_address_label')),
          TextField(
            controller: widget.emailController,
            keyboardType: TextInputType.emailAddress,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration:
                _inputStyle(AppStrings.get(context, 'email_hint'), errorText: _emailError),
            onChanged: (_) {
              if (_emailError != null) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _emailError = null);
                });
              }
            },
          ),
          const SizedBox(height: 24),

          // Phone Number
          AppLabel(text: AppStrings.get(context, 'phone_number_label')),
          TextField(
            controller: widget.phoneController,
            keyboardType: TextInputType.phone,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle(AppStrings.get(context, 'phone_hint'), errorText: _phoneError),
            onChanged: (_) {
              if (_phoneError != null) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _phoneError = null);
                });
              }
            },
          ),
          const SizedBox(height: 48),

          // Next Button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 0,
              ),
              onPressed: _handleNext,
              child: Text(
                AppStrings.get(context, 'next').toUpperCase(),
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 2.0,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Log In Text
          Center(
            child: RichText(
              text: TextSpan(
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
                children: [
                  TextSpan(text: AppStrings.get(context, 'already_have_account')),
                  TextSpan(
                    text: AppStrings.get(context, 'log_in'),
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = widget.onLoginTap,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
