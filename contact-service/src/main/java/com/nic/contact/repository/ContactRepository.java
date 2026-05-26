package com.nic.contact.repository;

import com.nic.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByGroupId(Long groupId);
    long countByGroupId(Long groupId);
    void deleteByGroupId(Long groupId);
}