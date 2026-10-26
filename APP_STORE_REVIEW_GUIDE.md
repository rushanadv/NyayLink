# NyayLink — Apple App Store Reviewer Guide & Sandbox Instructions

This document provides concise instructions for the Apple App Review team and developers evaluating NyayLink on iOS / Web.

---

## 1. Quick Access: Reviewer Sandbox Gateway

NyayLink provides a dedicated, isolated evaluation gateway at:
**`https://nyay.live/reviewer`** (or `http://localhost:3000/reviewer` locally)

The gateway allows 1-click server-authenticated access to both primary roles without exposing real citizen or advocate data.

### Supported Reviewer Roles & Credentials

| Role | Email | Target Route | Isolation Boundary |
| :--- | :--- | :--- | :--- |
| **Demo Client (Citizen)** | `demo.client@nyay.live` | `/dashboard` | Isolated user schema; synthetic case matters & test documents |
| **Demo Advocate (Counsel)** | `demo.lawyer@nyay.live` | `/lawyer/dashboard` | Isolated advocate profile; excluded from public search; synthetic cause-list |

> **Manual Sign-In Option:**  
> Reviewers can also enter credentials directly on standard `/auth/login`. Passwords are provided privately in App Store Connect Review Notes (`DEMO_CLIENT_PASSWORD` / `DEMO_LAWYER_PASSWORD`).

---

## 2. Key Features to Inspect

### A. Client Workspace (`/dashboard`)
1. **AI Preconsultation (`/dashboard?tab=intake` or `/intake`)**:
   - Automated informational legal triage grounded in Indian jurisprudence (BNS, CPC, Consumer Protection Act, RERA).
   - Prominent statutory disclaimer banner clarifying that the tool is informational and not an attorney-client relationship.
   - Voluntary consent control to carry intake summaries into formal advocate matters.
2. **Advocate Registry (`/dashboard?tab=advocates` or `/lawyers`)**:
   - Filter enrolled advocates by practice jurisdiction, high court / district court, language, and legal specialty.
   - Verification badges reflect State Bar Council enrollment validation under Rule 36 of the Bar Council of India.
3. **Legal Document Vault (`/dashboard?tab=documents`)**:
   - Private client storage under user-scoped Supabase storage paths.
   - Cryptographic SHA-256 integrity hash displayed for each uploaded legal document.
   - Authorised **Replace Document** and **Delete Document** actions with confirmation modal and server-side execution.
4. **Account Deletion (`/dashboard?tab=profile`)**:
   - Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023.
   - Requires password reauthentication and explicit confirmation phrase (`DELETE MY NYAYLINK ACCOUNT`).
   - Server-side cleanup of storage objects, profile records, and intake history.

### B. Advocate Workspace (`/lawyer/dashboard`)
1. **Verified Advocate Profile (`/lawyer/dashboard?tab=profile`)**:
   - Displays Bar Council enrollment status, verified academic degrees, and professional chamber address.
   - Rule 36 directory publication consent toggle.
2. **Consultation Requests (`/lawyer/dashboard?tab=consultations`)**:
   - Review incoming client legal inquiries, accept/reschedule consultations, and view client matter briefs.
3. **Court Calendar & Docket (`/lawyer/dashboard?tab=calendar`)**:
   - View scheduled hearings, judicial forum listings, and limitation deadline alerts.
4. **Advocate Account Deletion (`/lawyer/dashboard?tab=profile`)**:
   - End-to-end self-service account deletion for advocates with server-side authorization.

---

## 3. Transparency: Demonstrative vs. Live vs. External Capabilities

| Feature | Execution Type | Technical Implementation |
| :--- | :--- | :--- |
| **AI Preconsultation** | **Live Operational** | Groq Llama-3.3-70b / GPT-OSS inference with strict legal system prompt and fallback handling. |
| **Document Vault & Deletion** | **Live Operational** | SHA-256 hashing, Supabase Storage user-isolated buckets, and server-side deletion actions. |
| **Self-Service Account Deletion** | **Live Operational** | Server actions with password verification, storage object purge, foreign-key handling, and DPDP compliance. |
| **Court Docket Tracking** | **Synthetic Demonstration** | Populated with sample case numbers and hearing dates. Live real-time push synchronization requires formal e-Courts CIS API registry integration. |
| **Digital Vakalatnama Drafting** | **Template Generation** | Generates statutory Advocate Engagement Form under Section 30 of Advocates Act 1961. Full Aadhaar OTP biometric signing requires licensed CCA / UIDAI eSign ASP bridge. |
| **Advocate Consultations** | **Direct Engagement** | Facilitates direct client-counsel communication under transparent staged milestone terms. Does not operate escrow bank accounts. |

---

## 4. Safety & Reviewer Sandbox Isolation

- **No Real User Data**: Reviewer workspaces are populated exclusively with synthetic fixtures. Genuine advocate records (such as Adv. Shivangi Malhotra) are completely isolated.
- **Directory Isolation**: Demo and test accounts are excluded from public search results on `/lawyers`.
- **Safe Destructive Testing**: Reviewers may freely test document deletion, document replacement, or account deletion within the demo account without impacting other users.
- **Support Channel**: Inquiries during evaluation can be directed to `support@nyay.live`.
