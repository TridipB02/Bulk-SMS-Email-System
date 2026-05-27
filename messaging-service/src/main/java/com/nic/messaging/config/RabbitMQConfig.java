package com.nic.messaging.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Must match campaign-service exactly
    public static final String CAMPAIGN_EXCHANGE = "campaign.exchange";
    public static final String CAMPAIGN_QUEUE = "campaign.dispatch.queue";
    public static final String CAMPAIGN_ROUTING_KEY = "campaign.dispatch";

    // Notification events published by messaging-service
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.send";

    // Billing deduction events
    public static final String BILLING_EXCHANGE = "billing.exchange";
    public static final String BILLING_QUEUE = "billing.deduct.queue";
    public static final String BILLING_ROUTING_KEY = "billing.deduct";

    @Bean
    public DirectExchange campaignExchange() {
        return new DirectExchange(CAMPAIGN_EXCHANGE);
    }

    @Bean
    public Queue campaignQueue() {
        return QueueBuilder.durable(CAMPAIGN_QUEUE).build();
    }

    @Bean
    public Binding campaignBinding() {
        return BindingBuilder
                .bind(campaignQueue())
                .to(campaignExchange())
                .with(CAMPAIGN_ROUTING_KEY);
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(notificationExchange())
                .with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public DirectExchange billingExchange() {
        return new DirectExchange(BILLING_EXCHANGE);
    }

    @Bean
    public Queue billingQueue() {
        return QueueBuilder.durable(BILLING_QUEUE).build();
    }

    @Bean
    public Binding billingBinding() {
        return BindingBuilder
                .bind(billingQueue())
                .to(billingExchange())
                .with(BILLING_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}