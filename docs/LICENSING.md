# ORYN-AI Licensing Architecture & Legal Guidelines

## Overview

ORYN-AI is distributed as open-source software under the terms of the **Apache License, Version 2.0**. This document details the licensing principles, compliance specifications, and guidelines applicable to the ORYN-AI ecosystem, encompassing both the frontend application (`ORYN-AI-CLIENT`) and the backend analytics service (`ORYN-AI-SERVER`).

```text
Project:            ORYN-AI
Author & Creator:   Manasseh (MannieTech) <mannietech817@gmail.com>
Primary License:    Apache License, Version 2.0 (SPDX: Apache-2.0)
Effective Date:     2026-01-01
Jurisdiction:       International Open Source Standard
```

---

## 1. SPDX Identifier Standard

The System Package Data Exchange (SPDX) standard provides a machine-readable format for representing licensing metadata. For the ORYN-AI repository and all derivative packages:

- **SPDX-License-Identifier**: `Apache-2.0`
- **SPDX-URL**: https://spdx.org/licenses/Apache-2.0.html

Source files within this repository should reference this identifier in their leading commentary to ensure automated legal compliance and artifact scanning:

```typescript
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manasseh (MannieTech) <mannietech817@gmail.com>
```

---

## 2. Commercial Use Rights

Under the Apache License 2.0, commercial exploitation of ORYN-AI is expressly permitted without royalty obligations or fee assessments:

- **Enterprise Deployment**: You may deploy ORYN-AI within proprietary internal business environments.
- **SaaS & Cloud Hosting**: You may offer hosted versions, multi-tenant services, or cloud API endpoints utilizing ORYN-AI software.
- **Commercial Bundling**: You may bundle, embed, or sell ORYN-AI components alongside proprietary software suites.
- **Modification**: You may alter, extend, and rewrite internal components without requirement to open-source your proprietary additions (permissive, non-copyleft).

---

## 3. Express Patent Grant & Protection

Section 3 of the Apache License 2.0 provides an explicit, royalty-free, irrevocable patent license from every contributor to users of the software:

- **Contributor Grant**: Contributors grant users patent licenses to make, use, sell, and distribute the work.
- **Defensive Termination Clause**: If any entity institutes patent litigation against ORYN-AI or its contributors claiming patent infringement, any patent licenses granted to that entity terminate automatically. This shields the project and community from patent aggression.

---

## 4. Redistribution & Attribution Requirements

When redistributing ORYN-AI or derivative works in Source or Object form, you must adhere to the following 4 conditions (Section 4):

1. **Provide License Copy**: Include a copy of the Apache License 2.0 with all distributions.
2. **State Modifications**: Any modified files must carry prominent notices stating that you changed the files and the date of change.
3. **Retain Notices**: Retain all copyright, patent, trademark, and attribution notices from the source repository.
4. **NOTICE File**: If a `NOTICE` file is included in the source distribution, you must include a readable copy of the attribution notices in your derivative distribution.

---

## 5. Trademark Guidelines

The Apache License 2.0 explicitly **does not grant permission to use the trade names, trademarks, service marks, or product names** of the Licensor (Section 6):

- The names **"Oryn"**, **"Oryn AI"**, and **"MannieTech"** and associated logos are proprietary trademarks of Manasseh (MannieTech).
- You may use these names in text solely to describe the origin of the software or your integration with it.
- You may not use them as the primary branding of a commercial offering or imply endorsement without prior written authorization.

---

## 6. Contribution Licensing Agreement (Section 5)

Unless explicitly stated otherwise in writing, any contribution intentionally submitted for inclusion in ORYN-AI by any contributor is licensed under the Apache License 2.0 without additional terms or conditions.

---

## 7. Disclaimer of Warranty & Limitation of Liability

- **As-Is Provision (Section 7)**: The software is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
- **Limitation of Liability (Section 8)**: In no event shall contributors or copyright holders be liable for direct, indirect, incidental, or consequential damages resulting from the use or inability to use this software.

---

## 8. Summary Comparison

| Permission / Condition | Apache 2.0 Status |
|------------------------|-------------------|
| Commercial Use | ✅ Fully Permitted |
| Modification | ✅ Fully Permitted |
| Distribution | ✅ Fully Permitted |
| Private / Internal Use | ✅ Fully Permitted |
| Patent Grant | ✅ Explicit & Defended |
| Disclose Source | ❌ Not Required |
| Trademark Rights | ❌ Not Granted |
| License & Copyright Notice | ⚠️ Required on Redistribution |
| State Changes in Modified Files | ⚠️ Required |
