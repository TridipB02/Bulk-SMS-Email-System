package com.nic.campaign.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CAMPAIGN_EXCHANGE = "campaign.exchange";
    public static final String CAMPAIGN_QUEUE = "campaign.dispatch.queue";
    public static final String CAMPAIGN_ROUTING_KEY = "campaign.dispatch";

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