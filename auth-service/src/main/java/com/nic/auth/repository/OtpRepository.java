package com.nic.auth.repository;

import com.nic.auth.entity.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpStore, Long> {
    Optional<OtpStore> findTopByEmailOrderByIdDesc(String email);

    @Transactional
    void deleteByEmail(String email);
}