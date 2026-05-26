package com.nic.contact.service;

import com.nic.contact.dto.*;
import com.nic.contact.entity.Contact;
import com.nic.contact.entity.ContactGroup;
import com.nic.contact.repository.ContactGroupRepository;
import com.nic.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
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
                .map(g -> ContactGroupDTO.from(g, contactRepository.countByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    public ContactGroupDTO getGroupById(Long groupId) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return ContactGroupDTO.from(group, contactRepository.countByGroupId(groupId));
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        contactRepository.deleteByGroupId(groupId);
        groupRepository.deleteById(groupId);
    }

    // ─── Contacts ─────────────────────────────────────────

    public ContactDTO addContact(Long groupId, ContactRequest req) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        Contact contact = new Contact();
        contact.setName(req.getName());
        contact.setPhoneNumber(req.getPhoneNumber());
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

    public void deleteContact(Long contactId) {
        contactRepository.deleteById(contactId);
    }

    // ─── CSV Upload ───────────────────────────────────────

    @Transactional
    public ContactUploadResponse uploadCsv(Long groupId, MultipartFile file) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        int total = 0, success = 0, failed = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                total++;
                try {
                    String[] cols = line.split(",");
                    if (cols.length < 2) { failed++; continue; }

                    Contact contact = new Contact();
                    contact.setName(cols[0].trim());
                    contact.setPhoneNumber(cols[1].trim());
                    contact.setEmail(cols.length > 2 ? cols[2].trim() : null);
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
                "Upload complete. Success: " + success + ", Failed: " + failed);
    }

    // ─── Internal ─────────────────────────────────────────

    // Called by campaign-service to get contact count for a group
    public long getContactCount(Long groupId) {
        return contactRepository.countByGroupId(groupId);
    }

    // Called by messaging-service to get phone numbers for sending
    public List<String> getPhoneNumbersByGroup(Long groupId) {
        return contactRepository.findByGroupId(groupId)
                .stream()
                .map(Contact::getPhoneNumber)
                .collect(Collectors.toList());
    }
}