package com.nic.billing.repository;

import com.nic.billing.entity.BillingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillingTransactionRepository extends JpaRepository<BillingTransaction, Long> {
    List<BillingTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}