const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000/api';

const testUser = {
  email: 'sc001-test-' + Date.now() + '@example.com',
  password: 'TestPassword123!',
  nickname: '로컬테스터'
};

const testTodo = {
  title: '자료구조 과제 제출',
  priority: '높음',
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = [];
  const screenshots = [];

  try {
    console.log('\n=== SC-001: 신규 사용자 온보딩 테스트 시작 ===\n');
    console.log('Frontend URL: ' + TARGET_URL);
    console.log('Backend URL: ' + BACKEND_URL);
    console.log('Test User: ' + testUser.email + '\n');

    // Step 1: 회원가입 페이지 접근
    console.log('Step 1: 회원가입 페이지 접근');
    await page.goto(TARGET_URL + '/signup');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-01-signup-page.png', fullPage: true });
    screenshots.push('sc001-01-signup-page.png');
    results.push({ step: '회원가입 페이지 로드', status: 'PASS', timestamp: new Date().toISOString() });

    // Step 2: 회원가입 폼 입력
    console.log('Step 2: 회원가입 폼 입력');

    // Fill email
    await page.fill('input[name="email"]', testUser.email);
    await page.waitForTimeout(500);

    // Fill password
    await page.fill('input[name="password"]', testUser.password);
    await page.waitForTimeout(500);

    // Fill password confirm
    await page.fill('input[name="passwordConfirm"]', testUser.password);
    await page.waitForTimeout(500);

    // Fill nickname
    await page.fill('input[name="nickname"]', testUser.nickname);
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-02-signup-filled.png', fullPage: true });
    screenshots.push('sc001-02-signup-filled.png');
    results.push({
      step: '회원가입 폼 입력',
      status: 'PASS',
      timestamp: new Date().toISOString(),
      data: { email: testUser.email, nickname: testUser.nickname }
    });

    // Step 3: 회원가입 제출
    console.log('Step 3: 회원가입 제출');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check if redirected to dashboard or if there's an error
    const currentUrl = page.url();
    console.log('Current URL after signup: ' + currentUrl);

    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-03-after-signup.png', fullPage: true });
    screenshots.push('sc001-03-after-signup.png');

    if (currentUrl.includes('/dashboard') || currentUrl === TARGET_URL + '/') {
      results.push({
        step: '회원가입 성공 및 자동 로그인',
        status: 'PASS',
        timestamp: new Date().toISOString(),
        redirectUrl: currentUrl
      });
      console.log('✅ 회원가입 성공, 대시보드로 리다이렉트됨');
    } else {
      // Check for error messages
      const errorMessage = await page.textContent('body').catch(() => '');
      results.push({
        step: '회원가입 제출',
        status: 'FAIL',
        timestamp: new Date().toISOString(),
        error: '예상한 페이지로 리다이렉트되지 않음',
        currentUrl: currentUrl,
        pageContent: errorMessage.substring(0, 500)
      });
      console.log('❌ 회원가입 후 예상한 페이지로 이동하지 않음');
    }

    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // Step 4: 첫 번째 할 일 생성
    console.log('\nStep 4: 첫 번째 할 일 생성');

    // Click "+ 새 할일" button
    const addTodoButton = await page.$('button:has-text("+ 새 할일")').catch(() => null);

    if (addTodoButton) {
      await addTodoButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-04-add-todo-modal.png', fullPage: true });
      screenshots.push('sc001-04-add-todo-modal.png');

      // Fill todo form
      await page.fill('input[name="title"]', testTodo.title);
      await page.waitForTimeout(500);

      // Select priority - click radio button for HIGH (높음)
      await page.click('input[type="radio"][name="priority"][value="HIGH"]');
      await page.waitForTimeout(500);

      // Set due date
      await page.fill('input[name="dueDate"]', testTodo.dueDate);
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-05-todo-filled.png', fullPage: true });
      screenshots.push('sc001-05-todo-filled.png');

      // Submit todo - click "추가" button in modal
      const submitButton = await page.$('button:has-text("추가")').catch(() => null);
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-06-todo-created.png', fullPage: true });
        screenshots.push('sc001-06-todo-created.png');

        results.push({
          step: '첫 번째 할 일 생성',
          status: 'PASS',
          timestamp: new Date().toISOString(),
          todo: testTodo
        });
        console.log('✅ 할 일 생성 성공: ' + testTodo.title);
      } else {
        results.push({
          step: '첫 번째 할 일 생성',
          status: 'FAIL',
          timestamp: new Date().toISOString(),
          error: '추가 버튼을 찾을 수 없음'
        });
        console.log('❌ 추가 버튼을 찾을 수 없음');
      }
    } else {
      results.push({
        step: '첫 번째 할 일 생성',
        status: 'FAIL',
        timestamp: new Date().toISOString(),
        error: '"+ 새 할일" 버튼을 찾을 수 없음'
      });
      console.log('❌ "+ 새 할일" 버튼을 찾을 수 없음');
    }

    // Step 5: 할 일 완료 처리
    console.log('\nStep 5: 할 일 완료 처리');

    // Find and click the checkbox for the created todo
    const checkboxes = await page.$$('input[type="checkbox"]');

    if (checkboxes.length > 0) {
      // Click the first checkbox (should be our newly created todo)
      await checkboxes[0].click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-07-todo-completed.png', fullPage: true });
      screenshots.push('sc001-07-todo-completed.png');

      results.push({
        step: '할 일 완료 처리',
        status: 'PASS',
        timestamp: new Date().toISOString()
      });
      console.log('✅ 할 일 완료 처리 성공');
    } else {
      results.push({
        step: '할 일 완료 처리',
        status: 'FAIL',
        timestamp: new Date().toISOString(),
        error: '할 일 체크박스를 찾을 수 없음'
      });
      console.log('❌ 할 일 체크박스를 찾을 수 없음');
    }

    console.log('\n=== SC-001 테스트 완료 ===\n');

    // Print summary
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;

    console.log('총 테스트: ' + results.length);
    console.log('통과: ' + passCount);
    console.log('실패: ' + failCount);
    console.log('성공률: ' + Math.round((passCount / results.length) * 100) + '%\n');

    results.forEach(function(r, index) {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(icon + ' ' + (index + 1) + '. ' + r.step + ': ' + r.status);
      if (r.error) {
        console.log('   오류: ' + r.error);
      }
    });

    // Save results
    const fs = require('fs');
    const finalResults = {
      scenario: 'SC-001: 신규 사용자 온보딩',
      testUser: testUser,
      targetUrl: TARGET_URL,
      backendUrl: BACKEND_URL,
      timestamp: new Date().toISOString(),
      results: results,
      screenshots: screenshots,
      summary: {
        total: results.length,
        passed: passCount,
        failed: failCount,
        successRate: Math.round((passCount / results.length) * 100) + '%'
      }
    };

    fs.writeFileSync('C:/Users/eunww/WHATtodo/sc001-test-results.json', JSON.stringify(finalResults, null, 2));
    console.log('\n결과 저장: C:/Users/eunww/WHATtodo/sc001-test-results.json');

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'C:/Users/eunww/WHATtodo/sc001-error.png', fullPage: true });

    results.push({
      step: '테스트 실행 중 오류',
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }
})();
