import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageCubit extends Cubit<Locale> {
  LanguageCubit() : super(_getInitialLocale()) {
    _loadSavedLanguage();
  }

  static Locale _getInitialLocale() {
    try {
      final String systemLang = PlatformDispatcher.instance.locale.languageCode;
      debugPrint("SYSTEM LANGUAGE DETECTED: $systemLang");
      return Locale(systemLang == 'vi' ? 'vi' : 'en');
    } catch (e) {
      debugPrint("ERROR DETECTING SYSTEM LANGUAGE: $e");
      return const Locale('en');
    }
  }

  Future<void> _loadSavedLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final langCode = prefs.getString('language_code');
    if (langCode != null) {
      debugPrint("LOADED SAVED LANGUAGE: $langCode");
      emit(Locale(langCode));
    } else {
      debugPrint("NO SAVED LANGUAGE FOUND, USING SYSTEM DEFAULT");
    }
  }

  Future<void> changeLanguage(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', langCode);
    emit(Locale(langCode));
  }
}
