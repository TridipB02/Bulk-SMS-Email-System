package com.nic.billing.service;

import com.nic.billing.config.RabbitMQConfig;
import com.nic.billing.dto.*;
import com.nic.billing.entity.BillingTransaction;
import com.nic.billing.entity.CreditAccount;
import com.nic.billing.repository.BillingTransactionRepository;
import com.nic.billing.repository.CreditAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final CreditAccountRepository creditAccountRepository;
    private final BillingTransactionRepository transactionRepository;

    // ─── RabbitMQ Consumer ────────────────────────────────

    @RabbitListener(queues = RabbitMQConfig.BILLING_QUEUE)
    @Transactional
    public void handleDeductionEvent(DeductionEvent event) {
        log.info("Received billing deduction event for userId={}, amount={}",
                event.getUserId(), event.getAmount());
        try {
            deductCredits(event.getUserId(), event.getAmount(), event.getDescription());
        } catch (Exception e) {
            log.error("Failed to process billing event: {}", e.getMessage());
        }
    }

    // ─── Credit Account ───────────────────────────────────

    public CreditAccountDTO getOrCreateAccount(Long userId) {
        CreditAccount account = creditAccountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CreditAccount newAccount = new CreditAccount();
                    newAccount.setUserId(userId);
                    newAccount.setCredits(0);
                    return creditAccountRepository.save(newAccount);
                });
        return CreditAccountDTO.from(account);
    }

    @Transactional
    public CreditAccountDTO topUp(TopUpRequest req) {
        CreditAccount account = creditAccountRepository.findByUserId(req.getUserId())
                .orElseGet(() -> {
                    CreditAccount newAccount = new CreditAccount();
                    newAccount.setUserId(req.getUserId());
                    newAccount.setCredits(0);
                    return creditAccountRepository.save(newAccount);
                });

        account.setCredits(account.getCredits() + req.getAmount());
        account.setUpdatedAt(LocalDateTime.now());
        creditAccountRepository.save(account);

        // Record transaction
        BillingTransaction transaction = new BillingTransaction();
        transaction.setUserId(req.getUserId());
        transaction.setAmount(req.getAmount());
        transaction.setType(BillingTransaction.TransactionType.CREDIT);
        transaction.setDescription(req.getDescription());
        transaction.setBalanceAfter(account.getCredits());
        transactionRepository.save(transaction);

        log.info("Topped up {} credits for userId={}", req.getAmount(), req.getUserId());
        return CreditAccountDTO.from(account);
    }

    @Transactional
    public void deductCredits(Long userId, Integer amount, String description) {
        CreditAccount account = creditAccountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CreditAccount newAccount = new CreditAccount();
                    newAccount.setUserId(userId);
                    newAccount.setCredits(0);
                    return creditAccountRepository.save(newAccount);
                });

        // Deduct — allow negative balance so campaigns don't get blocked
        account.setCredits(account.getCredits() - amount);
        account.setUpdatedAt(LocalDateTime.now());
        creditAccountRepository.save(account);

        // Record transaction
        BillingTransaction transaction = new BillingTransaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setType(BillingTransaction.TransactionType.DEBIT);
        transaction.setDescription(description);
        transaction.setBalanceAfter(account.getCredits());
        transactionRepository.save(transaction);

        log.info("Deducted {} credits for userId={}. Balance after={}",
                amount, userId, account.getCredits());
    }

    // ─── Transactions ─────────────────────────────────────

    public List<TransactionDTO> getMyTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TransactionDTO::from)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(TransactionDTO::from)
                .collect(Collectors.toList());
    }
}