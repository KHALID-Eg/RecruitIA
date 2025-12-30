package org.keah.gatewayservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Filtre JWT pour Spring Cloud Gateway
 * Valide les tokens JWT générés par auth-service
 * Compatible avec JwtGenerator (auth-service)
 */
@Component
@Slf4j
public class JwtFilter extends AbstractGatewayFilterFactory<JwtFilter.Config> {

    @Value("${jwt.secret}")
    private String secretKey;

    public JwtFilter() {
        super(Config.class);
    }

    public static class Config {
        // Configuration vide - le filtre utilise les valeurs par défaut
    }

    /**
     * Génère la clé de signature HS256 (identique à auth-service)
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            String method = exchange.getRequest().getMethod() != null
                    ? exchange.getRequest().getMethod().name()
                    : "";

            // ✅ Autoriser CORS preflight
            if ("OPTIONS".equalsIgnoreCase(method)) {
                return chain.filter(exchange);
            }

            // ✅ Extraire le token Authorization
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header for path: {}", path);
                return onError(exchange, "Token manquant ou invalide", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // ✅ Valider et parser le token (même méthode que auth-service)
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // ✅ Extraire email (subject) et role
                String email = claims.getSubject();
                String role = claims.get("role", String.class);

                log.debug("JWT validated successfully for user: {} with role: {}", email, role);

                // ✅ Ajouter les headers utilisateur pour les services en aval
                ServerWebExchange mutated = exchange.mutate()
                        .request(req -> req
                                .header("X-User-Email", email)
                                .header("X-User-Role", role != null ? role : ""))
                        .build();

                return chain.filter(mutated);

            } catch (JwtException | IllegalArgumentException e) {
                log.error("JWT validation failed for path {}: {}", path, e.getMessage());
                return onError(exchange, "Token invalide ou expiré", HttpStatus.UNAUTHORIZED);
            } catch (Exception e) {
                log.error("Unexpected error during JWT validation: {}", e.getMessage(), e);
                return onError(exchange, "Erreur de validation du token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String msg, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        
        String errorBody = String.format(
            "{\"error\":\"%s\",\"status\":%d,\"path\":\"%s\"}",
            msg, status.value(), exchange.getRequest().getURI().getPath()
        );
        
        return exchange.getResponse()
                .writeWith(Mono.just(exchange.getResponse()
                        .bufferFactory()
                        .wrap(errorBody.getBytes(StandardCharsets.UTF_8))));
    }
}