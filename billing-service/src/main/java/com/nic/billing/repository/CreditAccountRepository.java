package com.nic.billing.repository;

import com.nic.billing.entity.CreditAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CreditAccountRepository extends JpaRepository<CreditAccount, Long> {
    Optional<CreditAccount> findByUserId(Long userId);
}