import { execSync } from 'child_process';
import path from 'path';

/**
 * Guardrail 1: Mandatory Test Case Addition Check
 * Verifies that if functional application code in `src/` (excluding tests) is modified or added,
 * at least one corresponding test file in `src/tests/` or matching `*.test.ts` is also modified or added.
 */
function verifyTestAddition() {
  console.log('\n============================================================');
  console.log('  GUARDRAIL #1: MANDATORY TEST CASE ADDITION VERIFICATION');
  console.log('============================================================');

  let changedFiles = [];
  try {
    // Determine target diff reference (against HEAD~1 or origin/main if available)
    let diffCmd = 'git diff --name-only HEAD~1 HEAD';
    if (process.env.GITHUB_BASE_REF) {
      diffCmd = `git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`;
    }

    const output = execSync(diffCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    changedFiles = output.split('\n').filter(Boolean);
  } catch (err) {
    // Fallback to git status for working directory changes
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      changedFiles = output
        .split('\n')
        .filter(Boolean)
        .map((line) => line.substring(3).trim());
    } catch (e) {
      console.log('⚠️ Could not execute git diff. Assuming single commit run.');
      return;
    }
  }

  if (changedFiles.length === 0) {
    console.log('ℹ️ No files changed in git workspace. Guardrail passed.');
    return;
  }

  console.log(`🔍 Inspecting ${changedFiles.length} modified file(s)...`);

  const functionalCodeChanges = changedFiles.filter((f) => {
    return (
      (f.startsWith('src/') || f.startsWith('server.')) &&
      !f.includes('/tests/') &&
      !f.endsWith('.test.ts') &&
      !f.endsWith('.spec.ts')
    );
  });

  const testCodeChanges = changedFiles.filter((f) => {
    return f.includes('/tests/') || f.endsWith('.test.ts') || f.endsWith('.spec.ts');
  });

  console.log(`📁 Functional code files changed : ${functionalCodeChanges.length}`);
  console.log(`🧪 Test suite files changed      : ${testCodeChanges.length}`);

  if (functionalCodeChanges.length > 0 && testCodeChanges.length === 0) {
    console.error('\n❌ GUARDRAIL VIOLATION: Functional code was modified without test additions!');
    console.error('Modified functional files:');
    functionalCodeChanges.forEach((f) => console.error(`  - ${f}`));
    console.error('\n💡 MANDATORY ACTION REQUIRED:');
    console.error('Every pull request or code change touching application logic must include unit/integration tests.');
    console.error('Please add or update a test in `src/tests/` targeting the affected functional behavior, then commit.');
    console.error('============================================================\n');
    process.exit(1);
  }

  console.log('✅ GUARDRAIL PASSED: Functional code changes accompanied by test updates or no code changed.');
  console.log('============================================================\n');
}

verifyTestAddition();
