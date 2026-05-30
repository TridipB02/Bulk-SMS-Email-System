package com.nic.contact.controller;

import com.nic.contact.dto.*;
import com.nic.contact.security.JwtUtil;
import com.nic.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final JwtUtil jwtUtil;

    // ─── Groups ───────────────────────────────────────────

    @PostMapping("/groups")
    public ResponseEntity<ContactGroupDTO> createGroup(
            @Valid @RequestBody ContactGroupRequest req,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(contactService.createGroup(req, userId));
    }

    @GetMapping("/groups")
    public ResponseEntity<List<ContactGroupDTO>> getMyGroups(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(contactService.getMyGroups(userId));
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ContactGroupDTO> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(contactService.getGroupById(groupId));
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable Long groupId) {
        contactService.deleteGroup(groupId);
        return ResponseEntity.ok("Group deleted");
    }

    // ─── Contacts ─────────────────────────────────────────

    @PostMapping("/groups/{groupId}/contacts")
    public ResponseEntity<ContactDTO> addContact(
            @PathVariable Long groupId,
            @Valid @RequestBody ContactRequest req) {
        return ResponseEntity.ok(contactService.addContact(groupId, req));
    }

    @GetMapping("/groups/{groupId}/contacts")
    public ResponseEntity<List<ContactDTO>> getContacts(@PathVariable Long groupId) {
        return ResponseEntity.ok(contactService.getContactsByGroup(groupId));
    }

    @DeleteMapping("/contacts/{contactId}")
    public ResponseEntity<String> deleteContact(@PathVariable Long contactId) {
        contactService.deleteContact(contactId);
        return ResponseEntity.ok("Contact deleted");
    }

    // ─── CSV Upload ───────────────────────────────────────

    @PostMapping("/groups/{groupId}/upload")
    public ResponseEntity<ContactUploadResponse> uploadCsv(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(contactService.uploadCsv(groupId, file));
    }

    // ─── Internal endpoints (called by other services) ────

    @GetMapping("/internal/groups/{groupId}/count")
    public ResponseEntity<Long> getContactCount(@PathVariable Long groupId) {
        return ResponseEntity.ok(contactService.getContactCount(groupId));
    }

    @GetMapping("/internal/groups/{groupId}/phones")
    public ResponseEntity<List<String>> getPhoneNumbers(@PathVariable Long groupId) {
        return ResponseEntity.ok(contactService.getPhoneNumbersByGroup(groupId));
    }

    @GetMapping("/internal/groups/{groupId}/emails")
    public ResponseEntity<List<String>> getEmails(@PathVariable Long groupId) {
        return ResponseEntity.ok(contactService.getEmailsByGroup(groupId));
    }

    // Search contacts
    @GetMapping("/groups/{groupId}/contacts/search")
    public ResponseEntity<List<ContactDTO>> searchContacts(
            @PathVariable Long groupId,
            @RequestParam String keyword) {
        return ResponseEntity.ok(contactService.searchContacts(groupId, keyword));
    }

    // Update contact
    @PutMapping("/contacts/{contactId}")
    public ResponseEntity<ContactDTO> updateContact(
            @PathVariable Long contactId,
            @Valid @RequestBody ContactRequest req) {
        return ResponseEntity.ok(contactService.updateContact(contactId, req));
    }

    // ─── Helper ───────────────────────────────────────────

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        // We use email as the user identifier since JWT stores email
        // campaign-service will pass userId directly
        // For now we parse from token claims
        return jwtUtil.extractUserId(token);
    }
}