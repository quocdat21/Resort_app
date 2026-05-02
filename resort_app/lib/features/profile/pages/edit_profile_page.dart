import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';

class EditProfilePage extends StatefulWidget {
  final Map<String, dynamic> userData;

  const EditProfilePage({super.key, required this.userData});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _dobController;
  late TextEditingController _addressController;

  String? _selectedGender;
  final List<String> _genders = ['Male', 'Female', 'Other'];

  File? _pickedImage;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _pickedImage = File(image.path);
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userData['full_name']);
    _emailController = TextEditingController(text: widget.userData['email']);
    _phoneController =
        TextEditingController(text: widget.userData['phone_number']);

    // Formatting date
    String dob = widget.userData['date_of_birth'] ?? '';

    if (dob.isNotEmpty) {
      try {
        final date = DateTime.parse(dob).toLocal();
        dob =
            "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
      } catch (e) {
        dob = '';
      }
    }
    _dobController = TextEditingController(text: dob);

    _addressController =
        TextEditingController(text: widget.userData['address']);

    String? gender = widget.userData['gender'];
    if (gender != null && gender.isNotEmpty && _genders.contains(gender)) {
      _selectedGender = gender;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    DateTime initialDate = DateTime.now();

    if (_dobController.text.isNotEmpty) {
      try {
        final parts = _dobController.text.split('/');
        initialDate = DateTime(
          int.parse(parts[2]), // year
          int.parse(parts[1]), // month
          int.parse(parts[0]), // day
        );
      } catch (e) {
        initialDate = DateTime.now();
      }
    }

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _dobController.text =
            "${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}";
      });
    }
  }

  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      String dob = _dobController.text.trim();
      String formattedDob = '';

      if (dob.isNotEmpty) {
        try {
          final parts = dob.split('/');
          formattedDob = "${parts[2]}-${parts[1]}-${parts[0]}";
        } catch (e) {
          formattedDob = '';
        }
      }

      final Map<String, String> data = {
        'full_name': _nameController.text.trim(),
        'phone_number': _phoneController.text.trim(),
        'date_of_birth': formattedDob,
        'gender': _selectedGender ?? '',
        'address': _addressController.text.trim(),
      };

      final response = await ApiService.updateProfile(
        data: data,
        avatarPath: _pickedImage?.path,
      );

      if (!mounted) return;

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppStrings.get(context, 'profile_updated'))),
        );
        Navigator.pop(context, true); // return true to refresh
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? AppStrings.get(context, 'update_failed'))),
        );
      }
    } catch (e) {
      if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppStrings.get(context, 'error_occurred'))),
        );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String avatarUrl = widget.userData['avatar_url'] ?? '';

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.get(context, 'edit_profile'),
          style: AppTextStyles.h3.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.onBackground,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // Avatar
                Center(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _pickImage,
                        child: Stack(
                          alignment: Alignment.bottomRight,
                          children: [
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.surfaceContainerHighest,
                                border: Border.all(
                                    color: AppColors.primary.withOpacity(0.1),
                                    width: 4),
                                image: _pickedImage != null
                                    ? DecorationImage(
                                        image: FileImage(_pickedImage!),
                                        fit: BoxFit.cover,
                                      )
                                    : (avatarUrl.isNotEmpty
                                        ? DecorationImage(
                                            image: NetworkImage(
                                                ApiService.fixImageUrl(
                                                    avatarUrl)),
                                            fit: BoxFit.cover,
                                          )
                                        : const DecorationImage(
                                            image: AssetImage(
                                                "assets/icons/profile.png"),
                                            fit: BoxFit.cover,
                                          )),
                              ),
                            ),
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                border: Border.all(
                                    color: AppColors.surface, width: 2),
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      GestureDetector(
                        onTap: _pickImage,
                        child: Text(
                          AppStrings.get(context, 'change_photo'),
                          style: AppTextStyles.labelSmall.copyWith(
                            color: const Color(0xFF7D6444),
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Form Fields
                _buildLabel(AppStrings.get(context, 'full_name').toUpperCase()),
                _buildTextField(
                  controller: _nameController,
                  icon: Icons.person_outline,
                  validator: (v) => v!.isEmpty ? AppStrings.get(context, 'required') : null,
                ),
                const SizedBox(height: 20),

                _buildLabel(AppStrings.get(context, 'email_address').toUpperCase()),
                _buildTextField(
                  controller: _emailController,
                  icon: Icons.mail_outline,
                  readOnly: true,
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      AppStrings.get(context, 'email_change_support'),
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.outline,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                _buildLabel(AppStrings.get(context, 'phone_number').toUpperCase()),
                _buildTextField(
                  controller: _phoneController,
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 20),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel(AppStrings.get(context, 'date_of_birth').toUpperCase()),
                          GestureDetector(
                            onTap: _selectDate,
                            child: AbsorbPointer(
                              child: _buildTextField(
                                controller: _dobController,
                                icon: Icons.calendar_today_outlined,
                                hintText: "YYYY-MM-DD",
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel(AppStrings.get(context, 'gender').toUpperCase()),
                          Container(
                            height: 56,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainerLowest,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.people_outline,
                                    color: AppColors.outline),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<String>(
                                      value: _selectedGender,
                                      hint: Text(AppStrings.get(context, 'select')),
                                      isExpanded: true,
                                      icon: const Icon(
                                          Icons.keyboard_arrow_down,
                                          color: AppColors.outline),
                                      items: [
                                        DropdownMenuItem(value: 'Male', child: Text(AppStrings.get(context, 'male'))),
                                        DropdownMenuItem(value: 'Female', child: Text(AppStrings.get(context, 'female'))),
                                        DropdownMenuItem(value: 'Other', child: Text(AppStrings.get(context, 'other'))),
                                      ],
                                      onChanged: (newValue) {
                                        setState(() {
                                          _selectedGender = newValue;
                                        });
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                _buildLabel(AppStrings.get(context, 'address').toUpperCase()),
                _buildTextField(
                  controller: _addressController,
                  icon: Icons.location_on_outlined,
                ),

                const SizedBox(height: 48),

                // Buttons
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    onPressed: _isLoading ? null : _saveChanges,
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            AppStrings.get(context, 'save_changes'),
                            style: AppTextStyles.bodyLarge.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: TextButton(
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF7D6444),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      AppStrings.get(context, 'cancel'),
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF7D6444),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          text,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.outline,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required IconData icon,
    bool readOnly = false,
    String? hintText,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      validator: validator,
      style: AppTextStyles.bodyLarge.copyWith(
        fontWeight: FontWeight.w500,
        color: readOnly ? AppColors.outline : AppColors.onSurface,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        prefixIcon: Icon(icon, color: AppColors.outline),
        filled: true,
        fillColor: readOnly
            ? AppColors.surfaceContainerHighest
            : AppColors.surfaceContainerLowest,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }
}
