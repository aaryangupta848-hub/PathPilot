# Smart Simulator + Exam Workspace Handoff

Last updated: 2026-03-18
Workspace: D:\DecisionSimulator

## Goal
Implement two features:
1. Smarter decision simulator with weights, priorities, budget, location, risk tolerance, and custom criteria.
2. Exam prep workspace for UPSC, CAT, GATE, JEE, SSC with syllabus tracking, mock analysis, revision plans, and weak-area detection.

## What is already done
- Extended decision-related types in `types/index.ts`.
  - Added `DecisionPriorityInput`
  - Added `DecisionPreferenceProfile`
  - Added `DecisionCriterionBreakdown`
  - Added `DecisionWeightedScores`
  - Expanded `DecisionAnalysis` with optional smarter-simulator fields
  - Expanded `ExamGuide` shape with planned exam-workspace fields (`syllabus`, `mock_sections`, `revision_plan`)
- Updated `services/decisionService.ts`.
  - `analyzeDecision()` now expects a richer payload:
    - `optionA`
    - `optionB`
    - `budget`
    - `location`
    - `riskTolerance`
    - `priorities`
    - `customCriteria`
    - `contextNotes`
- Created shared analysis UI component:
  - `components/decision/decision-analysis-view.tsx`
- Created exam performance chart component:
  - `components/charts/exam-performance-chart.tsx`

## What is NOT done yet
- `app/simulator/page.tsx` is still the old UI and still calls `analyzeDecision({ optionA, optionB })`.
  - This must be updated next, otherwise the new service signature is out of sync.
- `controllers/aiController.js` is still using the old two-option prompt/body.
- `utils/aiFallbacks.js` is still returning the old simpler decision shape.
- `lib/static-data.ts` has not been expanded with syllabus/mock/revision data for exams.
- `components/exams/exam-workspace.tsx` has not been created yet.
- `app/exams/[slug]/page.tsx` is still the old static guide page.
- `app/exams/page.tsx` is still the old listing page text/button copy.
- `app/simulator/[id]/page.tsx` has not been switched to reuse the new shared analysis component.
- Build verification has NOT been rerun for this feature branch after these partial changes.

## Recommended resume order
1. Update `utils/aiFallbacks.js`
   - Accept richer decision input.
   - Return the expanded `DecisionAnalysis` shape.
2. Update `controllers/aiController.js`
   - Read richer request payload.
   - Include weights, priorities, budget, location, risk tolerance, and custom criteria in the Gemini prompt.
   - Fall back to the new fallback helper shape.
3. Update `app/simulator/page.tsx`
   - Add new form inputs for:
     - budget
     - location
     - risk tolerance
     - weighted priorities
     - custom criteria
     - optional notes
   - Use `DecisionAnalysisView` to render results.
4. Update `app/simulator/[id]/page.tsx`
   - Reuse `DecisionAnalysisView` for consistency.
5. Expand `lib/static-data.ts`
   - Add `syllabus`, `mock_sections`, and `revision_plan` for UPSC, CAT, GATE, JEE, SSC.
6. Create `components/exams/exam-workspace.tsx`
   - Client component
   - Persist progress in `localStorage`
   - Add syllabus tracking, mock entry, average analysis, weak-area detection, revision checklist, notes
7. Update `app/exams/[slug]/page.tsx`
   - Keep server page shell
   - Render the new client workspace component
8. Optionally update `app/exams/page.tsx`
   - Change copy from “guide” toward “workspace” to reflect new behavior
9. Run `npm run build`

## Important current state
Because `services/decisionService.ts` now expects a richer payload but `app/simulator/page.tsx` still sends the old one, the simulator work is currently mid-migration.

## Files changed so far
- `D:\DecisionSimulator\types\index.ts`
- `D:\DecisionSimulator\services\decisionService.ts`
- `D:\DecisionSimulator\components\decision\decision-analysis-view.tsx`
- `D:\DecisionSimulator\components\charts\exam-performance-chart.tsx`

## Files expected to change next
- `D:\DecisionSimulator\app\simulator\page.tsx`
- `D:\DecisionSimulator\app\simulator\[id]\page.tsx`
- `D:\DecisionSimulator\controllers\aiController.js`
- `D:\DecisionSimulator\utils\aiFallbacks.js`
- `D:\DecisionSimulator\lib\static-data.ts`
- `D:\DecisionSimulator\components\exams\exam-workspace.tsx`
- `D:\DecisionSimulator\app\exams\[slug]\page.tsx`
- `D:\DecisionSimulator\app\exams\page.tsx`