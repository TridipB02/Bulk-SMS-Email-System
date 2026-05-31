package com.nic.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Must match messaging-service exactly
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.send";
    public static final String LOW_BALANCE_EXCHANGE = "lowbalance.exchange";
    public static final String LOW_BALANCE_QUEUE = "lowbalance.queue";
    public static final String LOW_BALANCE_ROUTING_KEY = "lowbalance.alert";

    @Bean
    public DirectExchange lowBalanceExchange() {
        return new DirectExchange(LOW_BALANCE_EXCHANGE);
    }

    @Bean
    public Queue lowBalanceQueue() {
        return QueueBuilder.durable(LOW_BALANCE_QUEUE).build();
    }

    @Bean
    public Binding lowBalanceBinding() {
        return BindingBuilder
                .bind(lowBalanceQueue())
                .to(lowBalanceExchange())
                .with(LOW_BALANCE_ROUTING_KEY);
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