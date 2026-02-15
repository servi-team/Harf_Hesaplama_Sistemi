package com.servi.harf;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HarfHesaplamaApplication {

    public static void main(String[] args) {
        SpringApplication.run(HarfHesaplamaApplication.class, args);
    }

}
