## 2026-09-05 - Control character and null-byte bypasses in URL redirect sanitizers

**Vulnerability:** `sanitizeRedirectPath` checked for starting slashes and URI components after decoding, but did not reject raw or decoded null bytes (`%00`, `\0`) and non-printable control characters (`\x00-\x1F`, `\x7F-\x9F`).
**Learning:** URL parsers in browsers or edge proxies treat control characters/null bytes differently—some truncate paths while others drop control characters, creating inconsistencies with custom relative path validators.
**Prevention:** Always validate against control characters and null bytes (`/[\x00-\x1F\x7F-\x9F]|%00/i`) in redirect path sanitizers both before and after URI decoding.
