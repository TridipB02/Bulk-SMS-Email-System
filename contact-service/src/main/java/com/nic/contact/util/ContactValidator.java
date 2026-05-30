package com.nic.contact.util;

public class ContactValidator {

    // Indian mobile number: starts with 6-9, exactly 10 digits
    public static boolean isValidPhoneNumber(String phone) {
        if (phone == null) return false;
        String cleaned = phone.replaceAll("[\\s\\-+]", "");
        // Handle +91 or 91 prefix
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        }
        return cleaned.matches("[6-9][0-9]{9}");
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) return true; // email is optional
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    public static String normalizePhone(String phone) {
        if (phone == null) return null;
        String cleaned = phone.replaceAll("[\\s\\-+]", "");
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        }
        return cleaned;
    }
}