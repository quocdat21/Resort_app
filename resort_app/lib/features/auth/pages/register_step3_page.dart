import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';

class RegisterStep3Page extends StatefulWidget {
  const RegisterStep3Page({super.key});

  @override
  State<RegisterStep3Page> createState() => _RegisterStep3PageState();
}

class _RegisterStep3PageState extends State<RegisterStep3Page> {
  bool _agreedToTerms = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text(
          "STEP 3 OF 3",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.onBackground,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildProgressBar(3),
              const SizedBox(height: 40),
              const Text(
                "Final Review",
                style: TextStyle(
                  fontFamily: AppTextStyles.fontFamily,
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                "Please ensure all details are correct\nbefore finalizing your membership.",
                style: AppTextStyles.bodyLarge,
              ),
              const SizedBox(height: 40),

              // PERSONAL DETAILS Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "PERSONAL DETAILS",
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.secondary,
                      letterSpacing: 1.5,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      // Navigate back to Step 1 or pop twice
                      Navigator.of(context).popUntil((route) => route.isFirst);
                    },
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      "Edit",
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
                    Text("FULL NAME", style: AppTextStyles.labelSmall),
                    const SizedBox(height: 8),
                    Text(
                      "Nguyen Minh Tam",
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text("EMAIL ADDRESS", style: AppTextStyles.labelSmall),
                    const SizedBox(height: 8),
                    Text(
                      "tam.nguyen@forestsanctuary.vn",
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
                          return AppColors.surfaceContainerHighest; // light gray
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
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurfaceVariant),
                        children: [
                          const TextSpan(text: "I agree to the "),
                          TextSpan(
                            text: "Terms of Sanctuary",
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          const TextSpan(text: " and\nacknowledge the privacy policy\nregarding forest conservation."),
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
                  onPressed: _agreedToTerms
                      ? () {
                          // Handle Submit
                        }
                      : null,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Submit",
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward, color: Colors.white, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressBar(int currentStep) {
    return Row(
      children: List.generate(3, (index) {
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: index < 2 ? 8.0 : 0),
            height: 4,
            decoration: BoxDecoration(
              color: index < currentStep
                  ? AppColors.primary
                  : AppColors.outlineVariant.withOpacity(0.5),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}
