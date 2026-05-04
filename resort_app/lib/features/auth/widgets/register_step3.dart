import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class Step3Form extends StatefulWidget {
  final String fullName;
  final String email;
  final VoidCallback onEdit;
  final VoidCallback onSubmit;

  const Step3Form({
    super.key,
    required this.fullName,
    required this.email,
    required this.onEdit,
    required this.onSubmit,
  });

  @override
  State<Step3Form> createState() => _Step3FormState();
}

class _Step3FormState extends State<Step3Form> {
  bool _agreedToTerms = true;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.get(context, 'final_review'),
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
            AppStrings.get(context, 'final_review_subtitle'),
            style: AppTextStyles.bodyLarge,
          ),
          const SizedBox(height: 40),

          // PERSONAL DETAILS Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppStrings.get(context, 'personal_details'),
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.secondary,
                  letterSpacing: 1.5,
                ),
              ),
              TextButton(
                onPressed: widget.onEdit,
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  AppStrings.get(context, 'edit'),
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Card details
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerHigh.withOpacity(0.4),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.get(context, 'full_name_label'), style: AppTextStyles.labelSmall),
                const SizedBox(height: 8),
                Text(
                  widget.fullName.isNotEmpty
                      ? widget.fullName
                      : "---",
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 20),
                Text(AppStrings.get(context, 'email_address_label'), style: AppTextStyles.labelSmall),
                const SizedBox(height: 8),
                Text(
                  widget.email.isNotEmpty
                      ? widget.email
                      : "---",
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          // Terms Checkbox
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: Checkbox(
                  value: _agreedToTerms,
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _agreedToTerms = val);
                    }
                  },
                  activeColor: AppColors.surfaceContainerHigh,
                  checkColor: AppColors.primary,
                  fillColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppColors.surfaceContainerHighest;
                    }
                    return Colors.transparent;
                  }),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  side: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.onSurfaceVariant),
                    children: [
                      TextSpan(text: AppStrings.get(context, 'agree_to_terms')),
                      TextSpan(
                        text: AppStrings.get(context, 'terms_of_sanctuary'),
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                      TextSpan(
                          text: AppStrings.get(context, 'and_acknowledge')),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 48),

          // Submit Button
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
              onPressed: _agreedToTerms ? widget.onSubmit : null,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    AppStrings.get(context, 'submit'),
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward,
                      color: Colors.white, size: 20),
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
