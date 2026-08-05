import fs from 'fs';
import path from 'path';

try {
  const jsonPath = path.resolve('test-results.json');
  const coverageSummaryPath = path.resolve('coverage/coverage-summary.json');

  let totalCumulative = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  const rows = [];

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);
    const testFiles = data.testResults || [];

    for (const file of testFiles) {
      const filePath = file.name || file.filepath || 'unknown';
      const relPath = path.relative(process.cwd(), filePath);
      const assertions = file.assertionResults || [];
      const passed = assertions.filter((a) => a.status === 'passed').length;
      const failed = assertions.filter((a) => a.status === 'failed').length;
      const total = assertions.length;

      totalCumulative += total;
      totalPassed += passed;
      totalFailed += failed;

      rows.push({
        file: relPath,
        total,
        passed,
        failed,
      });
    }
  }

  // Parse coverage if available
  let coverageMetrics = null;
  if (fs.existsSync(coverageSummaryPath)) {
    try {
      const covData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      if (covData.total) {
        coverageMetrics = {
          lines: covData.total.lines,
          statements: covData.total.statements,
          functions: covData.total.functions,
          branches: covData.total.branches,
        };
      }
    } catch (e) {
      // Ignore coverage parse errors
    }
  }

  let markdown = `## 📊 AutoRCA Test Suite & Code Coverage Execution Summary\n\n`;

  // Section 1: Cumulative Test Results
  markdown += `### 1. Cumulative Test Results\n\n`;
  markdown += `| Metric | Total Count | Status |\n`;
  markdown += `| :--- | :---: | :---: |\n`;
  markdown += `| **Total Cumulative Tests** | **${totalCumulative}** | 🧪 |\n`;
  markdown += `| **Total Cases Passed** | **${totalPassed}** | ✅ |\n`;
  markdown += `| **Total Cases Failed** | **${totalFailed}** | ${totalFailed > 0 ? '❌' : '🎉'} |\n\n`;

  // Section 2: Breakdown per Test File
  markdown += `### 2. Breakdown per Test Suite File\n\n`;
  markdown += `| Test File | Total Cases | Passed | Failed |\n`;
  markdown += `| :--- | :---: | :---: | :---: |\n`;

  for (const r of rows) {
    markdown += `| \`${r.file}\` | ${r.total} | ${r.passed} | ${r.failed > 0 ? `**${r.failed}**` : 0} |\n`;
  }

  // Section 3: Overall Coverage Summary
  if (coverageMetrics) {
    markdown += `\n### 3. Overall Code Coverage Summary\n\n`;
    markdown += `| Coverage Type | Covered / Total | Percentage | Threshold |\n`;
    markdown += `| :--- | :---: | :---: | :---: |\n`;
    markdown += `| **Line Coverage** | ${coverageMetrics.lines.covered} / ${coverageMetrics.lines.total} | **${coverageMetrics.lines.pct}%** | 80% |\n`;
    markdown += `| **Statement Coverage** | ${coverageMetrics.statements.covered} / ${coverageMetrics.statements.total} | **${coverageMetrics.statements.pct}%** | 80% |\n`;
    markdown += `| **Function Coverage** | ${coverageMetrics.functions.covered} / ${coverageMetrics.functions.total} | **${coverageMetrics.functions.pct}%** | 80% |\n`;
    markdown += `| **Branch Coverage** | ${coverageMetrics.branches.covered} / ${coverageMetrics.branches.total} | **${coverageMetrics.branches.pct}%** | 70% |\n\n`;
  }

  // Print to console stdout
  console.log('\n' + '='.repeat(68));
  console.log('                 AUTO-RCA TEST & COVERAGE SUMMARY');
  console.log('='.repeat(68));
  console.log(`Cumulative Tests : ${totalCumulative}`);
  console.log(`Passed           : ${totalPassed}`);
  console.log(`Failed           : ${totalFailed}`);
  console.log('-'.repeat(68));
  for (const r of rows) {
    console.log(`${r.file.padEnd(45)} | Total: ${String(r.total).padStart(2)} | Pass: ${String(r.passed).padStart(2)} | Fail: ${r.failed}`);
  }
  if (coverageMetrics) {
    console.log('-'.repeat(68));
    console.log(`Line Coverage    : ${coverageMetrics.lines.pct}% (${coverageMetrics.lines.covered}/${coverageMetrics.lines.total})`);
    console.log(`Branch Coverage  : ${coverageMetrics.branches.pct}% (${coverageMetrics.branches.covered}/${coverageMetrics.branches.total})`);
    console.log(`Function Coverage: ${coverageMetrics.functions.pct}% (${coverageMetrics.functions.covered}/${coverageMetrics.functions.total})`);
  }
  console.log('='.repeat(68) + '\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
    console.log('Successfully wrote execution summary to GITHUB_STEP_SUMMARY.');
  }
} catch (err) {
  console.error('Error generating test summary:', err);
}
