import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class Step2Form extends StatefulWidget {
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final VoidCallback onNext;

  const Step2Form({
    super.key,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.onNext,
  });

  @override
  State<Step2Form> createState() => _Step2FormState();
}

class _Step2FormState extends State<Step2Form> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  String? _passwordError;
  String? _confirmError;

  // Điều kiện mật khẩu
  bool get _has8Chars => widget.passwordController.text.length >= 8;
  bool get _hasSpecialSymbol =>
      RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(widget.passwordController.text);
  bool get _passwordsMatch =>
      widget.passwordController.text.isNotEmpty &&
      widget.passwordController.text == widget.confirmPasswordController.text;

  @override
  void initState() {
    super.initState();
    widget.passwordController.addListener(_onPasswordChanged);
    widget.confirmPasswordController.addListener(_onPasswordChanged);
  }

  void _onPasswordChanged() {
    setState(() {
      // Xoá lỗi khi người dùng đang sửa
      if (_passwordError != null) _passwordError = null;
      if (_confirmError != null) _confirmError = null;
    });
  }

  bool _validate() {
    bool isValid = true;
    setState(() {
      final password = widget.passwordController.text;
      final confirm = widget.confirmPasswordController.text;

      if (password.isEmpty) {
        _passwordError = AppStrings.get(context, 'register_error_password_empty');
        isValid = false;
      } else if (!_has8Chars) {
        _passwordError = AppStrings.get(context, 'register_error_password_short');
        isValid = false;
      } else if (!_hasSpecialSymbol) {
        _passwordError = AppStrings.get(context, 'register_error_password_special');
        isValid = false;
      } else {
        _passwordError = null;
      }

      if (confirm.isEmpty) {
        _confirmError = AppStrings.get(context, 'register_error_confirm_empty');
        isValid = false;
      } else if (!_passwordsMatch) {
        _confirmError = AppStrings.get(context, 'register_error_confirm_mismatch');
        isValid = false;
      } else {
        _confirmError = null;
      }
    });
    return isValid;
  }

  void _handleNext() {
    if (_validate()) {
      widget.onNext();
    }
  }

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
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.get(context, 'secure_your_stay'),
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
            AppStrings.get(context, 'password_subtitle'),
            style: AppTextStyles.bodyLarge,
          ),
          const SizedBox(height: 40),

          // PASSWORD
          AppLabel(text: AppStrings.get(context, 'password_label')),
          TextField(
            controller: widget.passwordController,
            obscureText: _obscurePassword,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration:
                _inputStyle("........", errorText: _passwordError).copyWith(
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: AppColors.outline,
                ),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // CONFIRM PASSWORD
          AppLabel(text: AppStrings.get(context, 'confirm_password_label')),
          TextField(
            controller: widget.confirmPasswordController,
            obscureText: _obscureConfirmPassword,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle(AppStrings.get(context, 're_enter_password_hint'),
                    errorText: _confirmError)
                .copyWith(
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: AppColors.outline,
                ),
                onPressed: () => setState(
                    () => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Chips — reactive to password content
          Row(
            children: [
              _buildValidationChip(
                label: AppStrings.get(context, 'char_8_plus'),
                isValid: _has8Chars,
              ),
              const SizedBox(width: 12),
              _buildValidationChip(
                label: AppStrings.get(context, 'special_symbol'),
                isValid: _hasSpecialSymbol,
              ),
            ],
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
                AppStrings.get(context, 'next'),
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Save For Later
          Center(
            child: TextButton(
              onPressed: () {},
              child: Text(
                AppStrings.get(context, 'save_for_later'),
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.secondary,
                  letterSpacing: 2.0,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  /// Chip hiển thị trạng thái: vàng khi đạt, xám khi chưa đạt
  Widget _buildValidationChip({
    required String label,
    required bool isValid,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isValid
            ? const Color(0xFFFDF0E1) // vàng nhạt
            : AppColors.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isValid ? Icons.check_circle_outline : Icons.radio_button_unchecked,
            size: 16,
            color: isValid ? AppColors.secondary : AppColors.outline,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: isValid ? AppColors.secondary : AppColors.onSurfaceVariant,
              letterSpacing: 0,
            ),
          ),
        ],
      ),
    );
  }
}
