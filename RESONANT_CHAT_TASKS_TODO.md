# Resonant Chat Task TODO (Agent11)

## Scope requested

- [x] Add back light/dark mode toggle in mobile header.
- [x] Reduce wide side blue line style to thin (1px) accents.
- [x] Improve chat text hierarchy and readability (headings, emphasis, spacing).
- [x] Improve markdown table rendering so tables are properly structured and scrollable on mobile.
- [x] Upgrade text-to-voice to sound more natural and support EN/RU/UK/AR voice selection.
- [x] Add live typing visual effect for assistant output without slowing backend generation.
- [x] Create full action plan for real-time two-way voice conversation (mic circle feature) with backend/service design.
- [ ] Run full validation (build/lint), then commit/push/deploy.
- [ ] Post implementation update to agent chat and verify with other agents.

## Notes

- Live typing effect is a UI pacing layer only; backend response generation speed is unchanged.
- Browser speech synthesis quality depends on installed OS/browser voices; code now prioritizes higher-quality voices where available.
