package com.nic.contact.repository;

import com.nic.contact.entity.ContactGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactGroupRepository extends JpaRepository<ContactGroup, Long> {
    List<ContactGroup> findByCreatedBy(Long userId);
}