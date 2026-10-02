# ORYN-AI Licensing Architecture & Legal Guidelines

## Overview

ORYN-AI is distributed as open-source software under the terms of the **MIT License**. This document details the licensing principles, compliance specifications, and guidelines applicable to the ORYN-AI ecosystem, encompassing both the frontend application (`ORYN-AI-CLIENT`) and the backend analytics service (`ORYN-AI-SERVER`).

```
Project:            ORYN-AI
Author & Creator:   Manasseh (MannieTech) <mannietech817@gmail.com>
Primary License:    MIT License (SPDX: MIT)
Effective Date:     2026-01-01
Jurisdiction:       International Open Source Standard
```

## 1. SPDX Identifier Standard

The System Package Data Exchange (SPDX) standard provides a machine-readable format for representing licensing metadata. For the ORYN-AI repository and all derivative packages:

- **SPDX-License-Identifier**: `MIT`
- **SPDX-URL**: https://spdx.org/licenses/MIT.html

Source files within this repository should reference this identifier in their leading commentary to ensure automated legal compliance and artifact scanning.

## 2. Commercial Use Rights

Under the MIT License, commercial exploitation of ORYN-AI is expressly permitted without royalty obligations or fee assessments:

- **Enterprise Deployment**: You may deploy ORYN-AI within proprietary internal business environments.
- **SaaS & Cloud Hosting**: You may offer hosted versions, multi-tenant services, or cloud API endpoints utilizing ORYN-AI software.
- **Commercial Bundling**: You may bundle, embed, or sell ORYN-AI components alongside proprietary software suites.

## 3. Modification & Derivative Works

Users and organizations possess full authority to adapt and enhance the codebase:

- **Source Refactoring**: You are permitted to modify any TypeScript, React, Node.js, or styling assets.
- **Custom Integrations**: Adding proprietary database drivers, specialized LLM wrappers, or enterprise single sign-on (SSO) modules is fully sanctioned.
- **Derivative Works**: Derivative works do not automatically require open-sourcing (permissive, non-copyleft license).

## 4. Redistribution & Sublicensing Provisions

Distribution rights are governed by clear, permissive conditions:

- **Source Code Distribution**: Copies of the original or altered source code may be distributed freely across public or private channels.
- **Compiled Binaries & Bundles**: You may distribute compiled output (such as Vite production bundles or transpiled Express server artifacts).
- **Sublicensing**: Downstream recipients may be licensed under differing terms (including proprietary commercial licenses), provided the original copyright notice is honored.

## 5. Copyright Notice & Attribution Compliance

The single mandatory obligation of the MIT License is preserving attribution:

- **Source Code Notice**: Every copy of the source code or substantial fraction thereof must retain the root `LICENSE` file.
- **Frontend Distribution**: In web applications distributing minified bundles, preserving the attribution in source maps, legal acknowledgment modals, or bundled license notices satisfies compliance.
- **Attribution Statement**:
  ```text
  Copyright (c) 2026 Manasseh (MannieTech) <mannietech817@gmail.com>
  ```

## 6. Limitation of Liability & Warranty Disclaimer

The Software is supplied on an "AS IS" basis:

- **No Warranty**: Neither the author nor contributors provide warranties of any kind, whether express, statutory, or implied, including merchantability or fitness for a particular purpose.
- **Limitation of Damages**: In no event shall the authors or copyright holders be held liable for any claim, damages, data loss, downtime, or other liabilities arising out of or in connection with the Software.
- **Risk Assumption**: Deployers and operators bear all responsibility for assessing suitability, security testing, and production deployment safety.

## 7. Source Code File Header Template

When authoring new source files or contributing significant modules to ORYN-AI, apply the following header convention:

```typescript
/**
 * ORYN-AI — Intelligent Enterprise Workspace & Analytics
 * 
 * Copyright (c) 2026 Manasseh (MannieTech) <mannietech817@gmail.com>
 * SPDX-License-Identifier: MIT
 * 
 * Licensed under the MIT License. See LICENSE in the project root for details.
 */
```

For CSS/SCSS or shell scripts, adjust the comment block syntax (`/* ... */` or `#`) accordingly while preserving the copyright and SPDX lines.

## 8. Third-Party Dependency Compliance Framework

ORYN-AI relies on third-party open-source packages across its frontend and backend stacks. All direct runtime dependencies must adhere to permissive open-source licenses compatible with the MIT license:

- **Approved Permissive Licenses**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC.
- **Restricted Licenses**: Copyleft licenses (GPL, AGPL) are prohibited from runtime dependencies to avoid contaminating proprietary user integrations.
- **Dependency Auditing**: Automated package scanners run regularly to audit transitive licensing structures.
