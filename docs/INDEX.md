# Career OS — Documentation Index

**Last updated:** 2026-09-17  
**Status:** Reorganized and standardized

---

## 📚 Quick Navigation

### 🚀 Getting Started
- [README.md](../README.md) - Project overview, setup, and current status
- [plan.md](../plan.md) - Detailed implementation plan and agent sequence

### 🏗️ Architecture (ADRs)
- [ADR-001: Technology Stack](architecture/ADR-001-stack.md) - Monorepo, Next.js, PostgreSQL, NVIDIA AI, n8n
- [ADR-002: AI Boundaries](architecture/ADR-002-ai-boundaries.md) - AI security and prompt injection prevention
- [ADR-003: Evidence Model](architecture/ADR-003-evidence.md) - Anti-hallucination system design
- [ADR-004: Audit and Immutability](architecture/ADR-004-audit.md) - Append-only audit trail
- [ADR-005: n8n Automation](architecture/ADR-005-n8n.md) - Self-hosted automation workflows

### 📋 Product Specifications
- [CV Template Engine](specifications/cv-templates-engine.md) - 3 professional CV templates with automatic selection
- [Gmail API Integration](specifications/gmail-api-integration.md) - OAuth 2.0, email classification, application tracking
- [UX/UI Design](specifications/ux-ui-design.md) - Design tokens, navigation, component library, commercial product design

### 🎨 Examples
- [CV Examples](examples/cv/) - Sample CVs for testing and reference
  - yassine_basir_analyse_financiere.md
  - yassine_basir_auditeur_financier.md
  - cv_basir_yassine_controle_gestion.md
  - cv_yassine_basir.md

### 📊 Data
- [Test Results](../data/test-results.md) - Test execution results and verification

---

## 🗂️ Documentation Structure

```
docs/
├── INDEX.md (this file)
├── architecture/          # Architecture Decision Records
│   ├── ADR-001-stack.md
│   ├── ADR-002-ai-boundaries.md
│   ├── ADR-003-evidence.md
│   ├── ADR-004-audit.md
│   └── ADR-005-n8n.md
├── specifications/       # Product specifications
│   ├── cv-templates-engine.md
│   ├── gmail-api-integration.md
│   └── ux-ui-design.md
└── examples/            # Example data and fixtures
    └── cv/              # Sample CVs
```

---

## 📖 Reading Order

### For New Contributors
1. Start with [README.md](../README.md)
2. Review [ADR-001: Technology Stack](architecture/ADR-001-stack.md)
3. Explore [plan.md](../plan.md) for implementation details

### For Product Understanding
1. [UX/UI Design Specification](specifications/ux-ui-design.md)
2. [CV Template Engine Specification](specifications/cv-templates-engine.md)
3. [Gmail API Integration Specification](specifications/gmail-api-integration.md)

### For Technical Implementation
1. [Architecture Decision Records](architecture/) (read in order)
2. [Implementation Plan](../plan.md)
3. [Test Results](../data/test-results.md)

---

## 🔍 Document Status

| Document | Status | Last Updated | Purpose |
|----------|--------|--------------|---------|
| README.md | ✅ Active | 2026-09-17 | Project overview |
| plan.md | ✅ Active | 2026-09-17 | Implementation roadmap |
| ADR-001-stack.md | ✅ Accepted | 2026-09-10 | Technology decisions |
| ADR-002-ai-boundaries.md | ✅ Accepted | 2026-09-10 | AI security |
| ADR-003-evidence.md | ✅ Accepted | 2026-09-10 | Evidence model |
| ADR-004-audit.md | ✅ Accepted | 2026-09-10 | Audit architecture |
| ADR-005-n8n.md | ✅ Accepted | 2026-09-10 | Automation |
| cv-templates-engine.md | ✅ Complete | 2026-09-17 | CV templates spec |
| gmail-api-integration.md | ✅ Complete | 2026-09-17 | Gmail integration spec |
| ux-ui-design.md | ✅ Complete | 2026-09-13 | UX/UI design spec |

---

## 🔄 Document Maintenance

### Adding New Documentation
1. Place in appropriate directory (architecture/, specifications/, examples/)
2. Update this INDEX.md
3. Add relevant cross-references in README.md
4. Include standard metadata header

### Standard Metadata Format
```markdown
# Document Title

**Created:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD  
**Status:** Draft/Review/Accepted/Deprecated  
**Author:** Name  
**Related:** [link to related documents]
```

---

## 📝 Change Log

### 2026-09-17
- **Major reorganization:** Standardized documentation structure
- **Created:** `docs/specifications/` directory for product specifications
- **Created:** `docs/examples/cv/` for example data
- **Created:** `data/` for test results and data files
- **Moved:** CV templates spec to `docs/specifications/cv-templates-engine.md`
- **Moved:** Gmail integration spec to `docs/specifications/gmail-api-integration.md`
- **Moved:** UX/UI spec to `docs/specifications/ux-ui-design.md`
- **Moved:** All CV examples to `docs/examples/cv/`
- **Moved:** Test results to `data/test-results.md`
- **Removed:** Duplicate UX/UI file from root directory
- **Created:** This INDEX.md for navigation

---

## 🔗 External References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NVIDIA AI Documentation](https://docs.nvidia.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)