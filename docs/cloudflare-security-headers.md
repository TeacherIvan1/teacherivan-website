# Cloudflare Edge Security & DNS Hardening Guide
## Domain: `teacherivan.com`

This runbook documents the production-grade edge security rules, defense-in-depth HTTP headers, and email authentication records (SPF, DKIM, DMARC) for `teacherivan.com` managed through Cloudflare.

---

## 1. Cloudflare Transform Rules — HTTP Response Headers

To protect students and administrators against clickjacking, MIME-sniffing, and cross-site protocol downgrades, configure the following **HTTP Response Header Modification Rules** in Cloudflare:

> **Navigation:** Cloudflare Dashboard &rarr; `teacherivan.com` &rarr; **Rules** &rarr; **Transform Rules** &rarr; **Modify Response Header** &rarr; **Create rule**

### Rule Name: `Teacher Ivan - Defensive Security Headers`
**If incoming request matches:**
```
(http.host eq "teacherivan.com" or http.host eq "www.teacherivan.com")
```

**Then perform header actions:**

| Header Action | Header Name | Value | Purpose / MITRE Defense |
| :--- | :--- | :--- | :--- |
| **Set static** | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS strictly for 1 year; prevents SSL stripping (MITRE T1557) |
| **Set static** | `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing by browsers (MITRE T1059.007) |
| **Set static** | `X-Frame-Options` | `SAMEORIGIN` | Mitigates clickjacking / framing attacks (MITRE T1190) |
| **Set static** | `Referrer-Policy` | `strict-origin-when-cross-origin` | Strips path data on external links; protects user privacy |
| **Set static** | `Permissions-Policy` | `camera=(), microphone=(self "https://teacherivan.com"), geolocation=(), payment=()` | Restricts browser hardware access; permits microphone strictly for Teacher Ivan Voice Lab |
| **Set static** | `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | Secures browsing context while permitting Google One-Tap Sign-In popups |

---

## 2. Cloudflare DNS & Email Authentication (Phishing & Impersonation Defense)

Protect `teacherivan.com` against domain spoofing, executive impersonation, and phishing (MITRE T1566, T1598, T1534).

> **Navigation:** Cloudflare Dashboard &rarr; `teacherivan.com` &rarr; **DNS** &rarr; **Records**

### 2.1 SPF (Sender Policy Framework)
- **Type:** `TXT`
- **Name:** `@` (or `teacherivan.com`)
- **Content:**
  ```text
  v=spf1 include:_spf.google.com ~all
  ```
- **TTL:** Auto
- **Explanation:** Authorizes Google Workspace / Gmail mail servers to send transactional messages for `teacherivan.com`. Soft-fails (`~all`) unauthorized senders.

### 2.2 DKIM (DomainKeys Identified Mail)
- **Type:** `TXT`
- **Name:** `google._domainkey`
- **Content:** *(Generated from Google Admin Console &rarr; Apps &rarr; Google Workspace &rarr; Gmail &rarr; Authenticate email)*
  ```text
  v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...[YOUR_KEY]...IDAQAB
  ```
- **TTL:** Auto
- **Explanation:** Cryptographically signs outbound emails from `ivan@teacherivan.com`, ensuring email integrity during transit.

### 2.3 DMARC (Domain-based Message Authentication, Reporting, and Conformance)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Content:**
  ```text
  v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@teacherivan.com; pct=100; sp=quarantine
  ```
- **TTL:** Auto
- **Explanation:** Instructs receiving mail servers (Gmail, Outlook, Yahoo) to quarantine 100% of emails failing SPF/DKIM verification and send aggregate forensic reports to `dmarc-reports@teacherivan.com`.

---

## 3. SSL/TLS & Edge WAF Best Practices

In Cloudflare **SSL/TLS**:
- **Encryption Mode:** `Full (strict)` (requires trusted certificates on origin server/Render).
- **Minimum TLS Version:** `TLS 1.2` (blocks deprecated TLS 1.0/1.1 protocols).
- **Always Use HTTPS:** `Enabled` (automatically redirects `http://` requests to `https://`).
- **Automatic HTTPS Rewrites:** `Enabled` (rewrites insecure subresource URLs).

In Cloudflare **Security** &rarr; **Bots**:
- **Bot Fight Mode:** `Enabled` (challenges malicious automated scrapers and credential-stuffing bots without blocking Googlebot or legitimate student browsers).
