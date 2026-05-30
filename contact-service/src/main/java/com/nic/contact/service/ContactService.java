package com.nic.contact.service;

import com.nic.contact.dto.*;
import com.nic.contact.entity.Contact;
import com.nic.contact.entity.ContactGroup;
import com.nic.contact.repository.ContactGroupRepository;
import com.nic.contact.repository.ContactRepository;
import com.nic.contact.util.ContactValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactGroupRepository groupRepository;
    private final ContactRepository contactRepository;

    // ─── Groups ───────────────────────────────────────────

    public ContactGroupDTO createGroup(ContactGroupRequest req, Long userId) {
        ContactGroup group = new ContactGroup();
        group.setName(req.getName());
        group.setDescription(req.getDescription());
        group.setCreatedBy(userId);
        groupRepository.save(group);
        return ContactGroupDTO.from(group, 0);
    }

    public List<ContactGroupDTO> getMyGroups(Long userId) {
        return groupRepository.findByCreatedBy(userId)
                .stream()
                .map(g -> ContactGroupDTO.from(g,
                        contactRepository.countByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    public ContactGroupDTO getGroupById(Long groupId) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return ContactGroupDTO.from(group,
                contactRepository.countByGroupId(groupId));
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        contactRepository.deleteByGroupId(groupId);
        groupRepository.deleteById(groupId);
    }

    // ─── Contacts ─────────────────────────────────────────

    public ContactDTO addContact(Long groupId, ContactRequest req) {
        // Validate phone number
        if (!ContactValidator.isValidPhoneNumber(req.getPhoneNumber())) {
            throw new RuntimeException("Invalid phone number: " + req.getPhoneNumber());
        }

        // Validate email if provided
        if (!ContactValidator.isValidEmail(req.getEmail())) {
            throw new RuntimeException("Invalid email: " + req.getEmail());
        }

        String normalizedPhone = ContactValidator.normalizePhone(req.getPhoneNumber());

        // Check duplicate within same group
        if (contactRepository.findByPhoneNumberAndGroupId(
                normalizedPhone, groupId).isPresent()) {
            throw new RuntimeException("Contact with phone "
                    + normalizedPhone + " already exists in this group");
        }

        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Contact contact = new Contact();
        contact.setName(req.getName());
        contact.setPhoneNumber(normalizedPhone);
        contact.setEmail(req.getEmail());
        contact.setGroup(group);
        return ContactDTO.from(contactRepository.save(contact));
    }

    public List<ContactDTO> getContactsByGroup(Long groupId) {
        return contactRepository.findByGroupId(groupId)
                .stream()
                .map(ContactDTO::from)
                .collect(Collectors.toList());
    }

    // Search contacts by name or phone
    public List<ContactDTO> searchContacts(Long groupId, String keyword) {
        return contactRepository.searchByGroupIdAndKeyword(groupId, keyword)
                .stream()
                .map(ContactDTO::from)
                .collect(Collectors.toList());
    }

    // Update contact
    public ContactDTO updateContact(Long contactId, ContactRequest req) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!ContactValidator.isValidPhoneNumber(req.getPhoneNumber())) {
            throw new RuntimeException("Invalid phone number: " + req.getPhoneNumber());
        }

        if (!ContactValidator.isValidEmail(req.getEmail())) {
            throw new RuntimeException("Invalid email: " + req.getEmail());
        }

        contact.setName(req.getName());
        contact.setPhoneNumber(
                ContactValidator.normalizePhone(req.getPhoneNumber()));
        contact.setEmail(req.getEmail());
        contact.setUpdatedAt(LocalDateTime.now());
        return ContactDTO.from(contactRepository.save(contact));
    }

    public void deleteContact(Long contactId) {
        contactRepository.deleteById(contactId);
    }

    // ─── CSV Upload with validation and dedup ─────────────

    @Transactional
    public ContactUploadResponse uploadCsv(Long groupId, MultipartFile file) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        int total = 0, success = 0, failed = 0, duplicates = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; }
                if (line.trim().isEmpty()) continue;
                total++;

                try {
                    String[] cols = line.split(",");
                    if (cols.length < 2) { failed++; continue; }

                    String name = cols[0].trim();
                    String phone = cols[1].trim();
                    String email = cols.length > 2 ? cols[2].trim() : null;

                    // Validate phone
                    if (!ContactValidator.isValidPhoneNumber(phone)) {
                        failed++;
                        continue;
                    }

                    // Validate email
                    if (!ContactValidator.isValidEmail(email)) {
                        failed++;
                        continue;
                    }

                    String normalizedPhone =
                            ContactValidator.normalizePhone(phone);

                    // Check duplicate within group
                    if (contactRepository.findByPhoneNumberAndGroupId(
                            normalizedPhone, groupId).isPresent()) {
                        duplicates++;
                        continue;
                    }

                    Contact contact = new Contact();
                    contact.setName(name);
                    contact.setPhoneNumber(normalizedPhone);
                    contact.setEmail(email);
                    contact.setGroup(group);
                    contactRepository.save(contact);
                    success++;

                } catch (Exception e) {
                    failed++;
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to process CSV: " + e.getMessage());
        }

        return new ContactUploadResponse(total, success, failed,
                "Upload complete. Success: " + success
                        + ", Failed: " + failed
                        + ", Duplicates skipped: " + duplicates);
    }

    // ─── Internal ─────────────────────────────────────────

    public long getContactCount(Long groupId) {
        return contactRepository.countByGroupId(groupId);
    }

    public List<String> getPhoneNumbersByGroup(Long groupId) {
        return contactRepository.findByGroupId(groupId)
                .stream()
                .map(Contact::getPhoneNumber)
                .collect(Collectors.toList());
    }

    public List<String> getEmailsByGroup(Long groupId) {
        return contactRepository.findByGroupId(groupId)
                .stream()
                .filter(c -> c.getEmail() != null && !c.getEmail().isEmpty())
                .map(Contact::getEmail)
                .collect(Collectors.toList());
    }
}