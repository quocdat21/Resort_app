import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  int _currentStep = 1;
  final PageController _pageController = PageController();

  // Step 1 Controllers
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  // Step 2 Controllers
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  // Step 3 State
  bool _agreedToTerms = true;

  @override
  void dispose() {
    _pageController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 3) {
      setState(() => _currentStep++);
      _pageController.animateToPage(
        _currentStep - 1,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 1) {
      setState(() => _currentStep--);
      _pageController.animateToPage(
        _currentStep - 1,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
      );
    } else {
      Navigator.pop(context);
    }
  }

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step - 1,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
          onPressed: _previousStep,
        ),
        centerTitle: true,
        title: Text(
          "STEP $_currentStep OF 3",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.onBackground,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
              child: _buildProgressBar(_currentStep),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1(),
                  _buildStep2(),
                  _buildStep3(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(int currentStep) {
    return Row(
      children: List.generate(3, (index) {
        return Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
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

  InputDecoration _inputStyle(String hint) {
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
      contentPadding: const EdgeInsets.symmetric(
        vertical: 20,
        horizontal: 16,
      ),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Create\nAccount",
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
            "Begin your journey into the Moc Chau sanctuary. Your forest hideaway awaits.",
            style: AppTextStyles.bodyLarge,
          ),
          const SizedBox(height: 40),

          // Full Name
          const AppLabel(text: "FULL NAME"),
          TextField(
            controller: _fullNameController,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle("Thao Nguyen"),
          ),
          const SizedBox(height: 24),

          // Email
          const AppLabel(text: "EMAIL ADDRESS"),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle("nature@sanctuary.com"),
          ),
          const SizedBox(height: 24),

          // Phone Number
          const AppLabel(text: "PHONE NUMBER"),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle("+84 000 000 000"),
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
              onPressed: _nextStep,
              child: Text(
                "NEXT",
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
                  const TextSpan(text: "Already have an account? "),
                  TextSpan(
                    text: "LOG IN",
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () {
                        Navigator.pop(context);
                      },
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

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Secure your\nstay.",
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
            "Choose a password to protect your account\nand bookings.",
            style: AppTextStyles.bodyLarge,
          ),
          const SizedBox(height: 40),

          // PASSWORD
          const AppLabel(text: "PASSWORD"),
          TextField(
            obscureText: _obscurePassword,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle("........").copyWith(
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: AppColors.outline),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // CONFIRM PASSWORD
          const AppLabel(text: "CONFIRM PASSWORD"),
          TextField(
            obscureText: _obscureConfirmPassword,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface, fontSize: 16),
            decoration: _inputStyle("Re-enter password").copyWith(
              suffixIcon: IconButton(
                icon: Icon(_obscureConfirmPassword ? Icons.visibility_off : Icons.visibility, color: AppColors.outline),
                onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Chips
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDF0E1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_outline, size: 16, color: AppColors.secondary),
                    const SizedBox(width: 6),
                    Text(
                      "8+ Characters",
                      style: AppTextStyles.labelSmall.copyWith(color: AppColors.secondary, letterSpacing: 0),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.radio_button_unchecked, size: 16, color: AppColors.outline),
                    const SizedBox(width: 6),
                    Text(
                      "Special symbol",
                      style: AppTextStyles.labelSmall.copyWith(color: AppColors.onSurfaceVariant, letterSpacing: 0),
                    ),
                  ],
                ),
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
              onPressed: _nextStep,
              child: Text(
                "Next",
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
                "SAVE FOR LATER",
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

  Widget _buildStep3() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
                  _goToStep(1);
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
                  _fullNameController.text.isNotEmpty ? _fullNameController.text : "Nguyen Minh Tam",
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
                  _emailController.text.isNotEmpty ? _emailController.text : "tam.nguyen@forestsanctuary.vn",
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
                      // Handle Final Submit
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
    );
  }
}
