import { execSync } from 'child_process';

/**
 * Guardrail 1: Mandatory Test Case Addition Verification
 * Enforces that whenever functional application code in `src/` or `server.ts` is modified or added,
 * at least one corresponding test file in `src/tests/` or matching `*.test.ts`/`*.spec.ts` must be included.
 * Non-functional updates (e.g. README.md, DEPLOYMENT.md, .env, package.json, assets, docs) are ignored.
 */
function verifyTestAddition() {
  console.log('\n============================================================');
  console.log('  GUARDRAIL #1: MANDATORY TEST CASE ADDITION VERIFICATION');
  console.log('============================================================');

  let changedFiles = [];
  try {
    let diffCmd = 'git diff --name-only HEAD~1 HEAD';
    if (process.env.GITHUB_BASE_REF) {
      diffCmd = `git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`;
    }

    const output = execSync(diffCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    changedFiles = output.split('\n').filter(Boolean);
  } catch (err) {
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      changedFiles = output
        .split('\n')
        .filter(Boolean)
        .map((line) => line.substring(3).trim());
    } catch (e) {
      console.log('⚠️ Could not execute git diff/status. Skipping test addition check.');
      return;
    }
  }

  if (changedFiles.length === 0) {
    console.log('ℹ️ No files changed in git workspace. Guardrail passed.');
    return;
  }

  console.log(`🔍 Inspecting ${changedFiles.length} modified file(s)...`);

  // Non-functional file patterns to ignore
  const isNonFunctionalFile = (f) => {
    return (
      f.endsWith('.md') ||
      f.endsWith('.json') ||
      f.endsWith('.yml') ||
      f.endsWith('.yaml') ||
      f.startsWith('.env') ||
      f.startsWith('.git') ||
      f.startsWith('assets/') ||
      f === 'Dockerfile' ||
      f === 'docker-compose.yml' ||
      f === 'nginx.conf' ||
      f === 'LICENSE' ||
      f === 'package-lock.json'
    );
  };

  const nonFunctionalChanges = changedFiles.filter(isNonFunctionalFile);

  const functionalCodeChanges = changedFiles.filter((f) => {
    if (isNonFunctionalFile(f)) return false;
    return (
      (f.startsWith('src/') || f.startsWith('server.')) &&
      !f.includes('/tests/') &&
      !f.endsWith('.test.ts') &&
      !f.endsWith('.test.tsx') &&
      !f.endsWith('.spec.ts') &&
      !f.endsWith('.spec.tsx')
    );
  });

  const testCodeChanges = changedFiles.filter((f) => {
    return (
      f.includes('/tests/') ||
      f.endsWith('.test.ts') ||
      f.endsWith('.test.tsx') ||
      f.endsWith('.spec.ts') ||
      f.endsWith('.spec.tsx')
    );
  });

  console.log(`📄 Non-functional / Doc files changed : ${nonFunctionalChanges.length}`);
  console.log(`📁 Functional code files changed       : ${functionalCodeChanges.length}`);
  console.log(`🧪 Test suite files changed            : ${testCodeChanges.length}`);

  if (functionalCodeChanges.length > 0 && testCodeChanges.length === 0) {
    console.error('\n❌ GUARDRAIL VIOLATION: Functional code was modified without test updates!');
    console.error('Modified functional files:');
    functionalCodeChanges.forEach((f) => console.error(`  - ${f}`));
    console.error('\n💡 MANDATORY ACTION REQUIRED:');
    console.error('Every pull request or commit modifying application logic must include unit/integration tests.');
    console.error('Please add or update a test in `src/tests/` targeting the affected functional behavior, then retry.');
    console.error('============================================================\n');
    process.exit(1);
  }

  console.log('✅ GUARDRAIL PASSED: All functional code changes are accompanied by test updates.');
  console.log('============================================================\n');
}

verifyTestAddition();

