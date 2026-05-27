package com.nic.billing.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Must match messaging-service exactly
    public static final String BILLING_EXCHANGE = "billing.exchange";
    public static final String BILLING_QUEUE = "billing.deduct.queue";
    public static final String BILLING_ROUTING_KEY = "billing.deduct";

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