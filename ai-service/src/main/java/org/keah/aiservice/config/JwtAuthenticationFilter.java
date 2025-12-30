package org.keah.aiservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip JWT filter for service-to-service extraction endpoint
        return "/ai/extract".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip authentication for service-to-service extraction endpoint
        if ("/ai/extract".equals(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        // System.out.println("AI-SERVICE: Checking auth header: " + (authHeader != null ? "Present" : "Missing"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.isValid(token)) {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                
                // System.out.println("AI-SERVICE: Token valid. Email: " + email + ", Role: " + role);

                List<GrantedAuthority> authorities = Collections.emptyList();
                if (role != null) {
                    // Start with ROLE_ convention if not present
                    String normalizedRole = role.toUpperCase();
                    String authority = normalizedRole.startsWith("ROLE_") ? normalizedRole : "ROLE_" + normalizedRole;
                    authorities = List.of(new SimpleGrantedAuthority(authority));
                    // System.out.println("AI-SERVICE: Assigned Authority: " + authority);
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.err.println("AI-SERVICE: Token invalid!");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalid or expired");
                return;
            }
        } else {
             // System.out.println("AI-SERVICE: No Bearer token found in header");
        }

        filterChain.doFilter(request, response);
    }
}
