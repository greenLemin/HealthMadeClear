1. **Understand the code health issue:** `DashboardClient.tsx` is large (~500 lines) and contains multiple distinct sections (Header, Stats, Recommended Next, My Learning Paths, Recent Activity, Recently Earned Achievements). This makes it harder to maintain and read.
2. **Design the improvement:** Refactor the file by breaking it down into smaller, focused component files in a `components` subdirectory within the dashboard folder. I've created the placeholder files.
3. **Refactoring steps:**
   - Create `src/app/[locale]/dashboard/components/DashboardHeader.tsx` (Welcome, export/import).
   - Create `src/app/[locale]/dashboard/components/DashboardStats.tsx` (Summary cards).
   - Create `src/app/[locale]/dashboard/components/RecommendedNext.tsx` (Next action or active path card).
   - Create `src/app/[locale]/dashboard/components/LearningPaths.tsx` (In-progress paths grid).
   - Create `src/app/[locale]/dashboard/components/RecentActivity.tsx` (Recent activity list).
   - Create `src/app/[locale]/dashboard/components/EarnedAchievements.tsx` (Achievements grid).
   - Update `DashboardClient.tsx` to import and use these new components, passing necessary props.
   - Refactor the types shared between these into a new `types.ts` file or define them locally if only used by one. Better yet, we can keep the types in `DashboardClient.tsx` and export them, or create a `src/app/[locale]/dashboard/types.ts` since many components will need them. I will create a `src/app/[locale]/dashboard/types.ts` file.
4. **Validation:** Run type check, linting, and build to ensure no functionality is broken.
5. **Commit:** Ensure pre-commit checks run and commit with the appropriate message format.
