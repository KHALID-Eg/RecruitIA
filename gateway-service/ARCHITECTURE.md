# 🏗️ Architecture Gateway Service - Documentation Complète

## 📋 Vue d'ensemble

Le `gateway-service` est un **Spring Cloud Gateway** qui agit comme point d'entrée unique pour tous les microservices. Il gère :
- ✅ Le routage vers les services (Eureka Service Discovery)
- ✅ L'authentification JWT pour les routes protégées
- ✅ La configuration CORS pour le frontend
- ✅ Le filtrage des requêtes non autorisées

---

## 🗂️ Structure des Packages

```
gateway-service/
├── src/main/java/org/keah/gatewayservice/
│   ├── GatewayServiceApplication.java       # Point d'entrée Spring Boot
│   └── security/
│       └── JwtFilter.java                   # Filtre JWT pour Gateway
└── src/main/resources/
    └── application.yml                      # Configuration complète
```

---

## 🔐 JwtFilter - Détails d'Implémentation

### Classe : `JwtFilter.java`

**Héritage :** `AbstractGatewayFilterFactory<JwtFilter.Config>`

**Responsabilités :**
1. Valider les tokens JWT pour les routes protégées
2. Extraire `email` (subject) et `role` (claim) du token
3. Ajouter les headers `X-User-Email` et `X-User-Role` pour les services en aval
4. Rejeter les requêtes sans token valide avec `401 Unauthorized`

**Compatibilité JWT :**
- ✅ Utilise la **même méthode** que `JwtGenerator` (auth-service)
- ✅ Utilise `Keys.hmacShaKeyFor()` pour générer la clé HS256
- ✅ Utilise `Jwts.parserBuilder()` pour parser le token
- ✅ Secret JWT identique : `MYSUPERSECRETKEY256BITSMINIMUMFORJWT=====`

**Format du Token (auth-service) :**
```json
{
  "sub": "user@example.com",    // Email (subject)
  "role": "CANDIDATE",          // Role (claim)
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 🚦 Configuration des Routes (application.yml)

### Route 1: Auth Service (PUBLIC)
```yaml
- id: auth-service-route
  uri: lb://AUTH-SERVICE
  predicates:
    - Path=/auth/**
  filters:
    - StripPrefix=0    # Pas de filtre JWT - routes publiques
```

**Endpoints accessibles :**
- `POST /auth/register-candidate` ✅ Public
- `POST /auth/login` ✅ Public
- Tous les autres `/auth/**` ✅ Public

### Route 2: Candidate Service (PROTÉGÉ)
```yaml
- id: candidate-service-route
  uri: lb://CANDIDATE-SERVICE
  predicates:
    - Path=/candidates/**
  filters:
    - name: JwtFilter    # JWT obligatoire
```

**Endpoints accessibles :**
- `GET /candidates/me` ✅ Requiert JWT
- `POST /candidates/internal` ✅ Requiert JWT (ou peut être public côté service)
- Tous les autres `/candidates/**` ✅ Requiert JWT

### Route 3: Offer Service (PROTÉGÉ)
```yaml
- id: offer-service-route
  uri: lb://OFFER-SERVICE
  predicates:
    - Path=/offers/**
  filters:
    - name: JwtFilter    # JWT obligatoire
```

**Endpoints accessibles :**
- Tous les `/offers/**` ✅ Requiert JWT

---

## 🔑 Configuration JWT

### Secret JWT
Le secret JWT doit être **identique** dans :
- ✅ `auth-service` (génération)
- ✅ `gateway-service` (validation)
- ✅ `candidate-service` (validation si nécessaire)

**Valeur actuelle :**
```yaml
jwt:
  secret: MYSUPERSECRETKEY256BITSMINIMUMFORJWT=====
  expiration: 86400000  # 24 heures (ms)
```

---

## 🧭 Configuration Eureka

Le gateway utilise **Eureka Service Discovery** pour résoudre les noms de services :

```yaml
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

**Services attendus dans Eureka :**
- `AUTH-SERVICE` → Port 8081
- `CANDIDATE-SERVICE` → Port 8085
- `OFFER-SERVICE` → Port configuré

**Important :** Le service discovery locator est **désactivé** pour éviter les routes automatiques.

---

## ✅ Checklist de Validation

### 1. Vérification du Démarrage
- [ ] Gateway démarre sans erreur
- [ ] Se connecte à Eureka
- [ ] Routes chargées correctement
- [ ] Filtre JWT détecté par Spring

### 2. Vérification Eureka
- [ ] `AUTH-SERVICE` visible dans Eureka Dashboard
- [ ] `CANDIDATE-SERVICE` visible dans Eureka Dashboard
- [ ] `OFFER-SERVICE` visible dans Eureka Dashboard (si démarré)
- [ ] Status: UP pour tous les services

### 3. Test des Routes Publiques
- [ ] `POST http://localhost:8888/auth/register-candidate` → 200/201
- [ ] `POST http://localhost:8888/auth/login` → 200 avec token

### 4. Test des Routes Protégées
- [ ] `GET http://localhost:8888/candidates/me` sans token → 401
- [ ] `GET http://localhost:8888/candidates/me` avec token → 200
- [ ] `GET http://localhost:8888/offers/**` sans token → 401
- [ ] `GET http://localhost:8888/offers/**` avec token → 200

### 5. Vérification JWT
- [ ] Token généré par auth-service est accepté par gateway
- [ ] Email et role extraits correctement
- [ ] Headers `X-User-Email` et `X-User-Role` ajoutés aux requêtes

---

## 🧪 Guide de Test avec Postman

### Étape 1: Register (Publique)
```
POST http://localhost:8888/auth/register-candidate
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "test@example.com",
  "role": "CANDIDATE"
}
```

### Étape 2: Login (Publique)
```
POST http://localhost:8888/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Réponse attendue :** Même format que Register

### Étape 3: Appel Endpoint Protégé (Avec Token)
```
GET http://localhost:8888/candidates/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue :**
- Si token valide → 200 avec données candidat
- Si token invalide/absent → 401 Unauthorized

### Étape 4: Test Sans Token (Doit Échouer)
```
GET http://localhost:8888/candidates/me
(Sans header Authorization)
```

**Réponse attendue :** 401 Unauthorized

---

## 🔧 Dépannage

### Problème : 404 Not Found sur /auth/**
**Solution :**
1. Vérifier que `AUTH-SERVICE` est enregistré dans Eureka
2. Vérifier le nom du service : doit être `AUTH-SERVICE` (majuscules)
3. Vérifier que le gateway peut résoudre le service via `lb://AUTH-SERVICE`

### Problème : 401 Unauthorized même avec token valide
**Solution :**
1. Vérifier que le `jwt.secret` est identique dans auth-service et gateway-service
2. Vérifier le format du token dans les logs (débug activé)
3. Vérifier que le token n'est pas expiré

### Problème : Routes /candidates/** accessibles sans token
**Solution :**
1. Vérifier que le filtre `JwtFilter` est bien configuré dans `application.yml`
2. Vérifier que le composant `@Component` est présent sur `JwtFilter`
3. Redémarrer le gateway

### Problème : Gateway ne démarre pas
**Solution :**
1. Vérifier que Eureka est démarré (port 8761)
2. Vérifier les dépendances Maven
3. Vérifier les logs pour erreurs de configuration

---

## 📚 Ressources

- **Spring Cloud Gateway Docs :** https://spring.io/projects/spring-cloud-gateway
- **Eureka Service Discovery :** https://spring.io/projects/spring-cloud-netflix
- **JJWT Library :** https://github.com/jwtk/jjwt

---

## ✨ Points Importants

1. ✅ **Pas de Spring Security classique** dans Gateway (utilise WebFlux)
2. ✅ **Filtre JWT automatique** via `AbstractGatewayFilterFactory`
3. ✅ **Routes publiques** `/auth/**` sans filtre JWT
4. ✅ **Routes protégées** `/candidates/**` et `/offers/**` avec filtre JWT
5. ✅ **Compatibilité totale** avec auth-service (même secret, même méthode)

---

**Dernière mise à jour :** 2025-12-19

