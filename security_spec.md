# Security Specification: Wire Connect: Cyber Circuit

## 1. Data Invariants
- `users/{userId}`:
  - Path variable `{userId}` must equal `request.auth.uid`.
  - Only the authenticated owner can read or write their own user profile document.
  - The document `userId` field must match `request.auth.uid` and `{userId}` path.
  - Required fields on creation: `userId`, `displayName`, `highestLevel`, `totalScore`, `starsEarned`, `currentStreak`, `puzzlesSolved`.
  - Non-negative integer values for numeric progress fields.
  - String size bounds: `displayName` <= 100, `photoURL` <= 500.

- `leaderboard/{userId}`:
  - Publicly readable to allow all players to see the global circuit rankings.
  - Write access restricted strictly to `request.auth.uid == userId`.
  - Required fields: `userId`, `displayName`, `score`, `highestLevel`, `stars`.
  - Non-negative integers for `score`, `highestLevel`, `stars`.
  - `displayName` length <= 100.

## 2. Dirty Dozen Attack Payloads
1. **Unauthenticated Profile Read**: Anonymous/Unauthenticated user tries to read `/users/user_123` -> DENIED
2. **Cross-User Profile Read**: `user_abc` attempts to read `/users/user_xyz` -> DENIED
3. **Cross-User Profile Write**: `user_abc` attempts to write `/users/user_xyz` -> DENIED
4. **UID Spoofing**: `user_123` attempts to write `/users/user_123` with `{ userId: 'user_456' }` -> DENIED
5. **Junk Path ID Poisoning**: Trying to create document with 2KB special character ID -> DENIED
6. **Negative Score Injection**: Trying to set `totalScore: -500` -> DENIED
7. **Negative Level Injection**: Trying to set `highestLevel: -1` -> DENIED
8. **Oversized String DoS Attack**: Trying to write 100KB `displayName` -> DENIED
9. **Unauthenticated Leaderboard Write**: Unauthenticated user trying to submit leaderboard score -> DENIED
10. **Cross-User Leaderboard Impersonation**: `user_abc` attempting to overwrite `user_xyz`'s leaderboard entry -> DENIED
11. **Negative Leaderboard Score**: `user_123` submitting `{ score: -9999 }` -> DENIED
12. **Leaderboard Spoofed UID**: `user_123` writing to `/leaderboard/user_123` with `{ userId: 'admin' }` -> DENIED
