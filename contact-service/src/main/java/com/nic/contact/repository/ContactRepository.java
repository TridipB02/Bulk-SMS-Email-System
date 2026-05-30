package com.nic.contact.repository;

import com.nic.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByGroupId(Long groupId);
    long countByGroupId(Long groupId);
    void deleteByGroupId(Long groupId);

    // Duplicate check within same group
    Optional<Contact> findByPhoneNumberAndGroupId(String phoneNumber, Long groupId);

    // Search by name or phone
    @Query("SELECT c FROM Contact c WHERE c.group.id = :groupId " +
            "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR c.phoneNumber LIKE CONCAT('%', :keyword, '%'))")
    List<Contact> searchByGroupIdAndKeyword(Long groupId, String keyword);
}