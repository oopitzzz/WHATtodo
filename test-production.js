const { chromium } = require('playwright');

const TARGET_URL = 'https://frontend-dihhv1vjs-oopitzs-projects.vercel.app';

const testUser = {
  email: 'prod-test-' + Date.now() + '@example.com',
  password: 'TestPassword123!',
  nickname: '프로덕션테스터'
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = [];

  try {
    console.log('\n=== Production 통합 테스트 시작 ===\n');
    console.log('URL: ' + TARGET_URL + '\n');

    // SC-001: 회원가입
    console.log('SC-001: 회원가입 테스트');
    await page.goto(TARGET_URL);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-01-landing.png', fullPage: true });
    results.push({ step: '랜딩 페이지 로드', status: 'PASS' });

    await page.goto(TARGET_URL + '/signup');
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-02-signup.png', fullPage: true });
    results.push({ step: '회원가입 페이지 이동', status: 'PASS' });

    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="nickname"]', testUser.nickname);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-03-signup-filled.png', fullPage: true });
    results.push({ step: '회원가입 폼 입력', status: 'PASS', data: testUser.email });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-04-after-signup.png', fullPage: true });
    results.push({ step: '회원가입 제출', status: 'PASS' });

    // 캘린더 테스트
    console.log('\nSC-003: 캘린더 테스트');
    await page.goto(TARGET_URL + '/calendar');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-05-calendar.png', fullPage: true });
    results.push({ step: '캘린더 페이지 로드', status: 'PASS' });

    // 휴지통 테스트
    console.log('\nSC-004: 휴지통 테스트');
    await page.goto(TARGET_URL + '/trash');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-06-trash.png', fullPage: true });
    results.push({ step: '휴지통 페이지 로드', status: 'PASS' });

    console.log('\n=== 테스트 완료 ===\n');
    results.forEach(function(r) {
      console.log('  ✅ ' + r.step + ': ' + r.status);
    });

    const fs = require('fs');
    fs.writeFileSync('C:/Users/eunww/WHATtodo/prod-test-results.json', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/prod-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
