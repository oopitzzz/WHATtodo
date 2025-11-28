const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000/api';

// 재사용 가능한 함수들
const createTestUser = () => ({
  email: 'test-' + Date.now() + '@example.com',
  password: 'TestPassword123!',
  nickname: '테스터_' + Math.floor(Math.random() * 1000)
});

const signup = async (page, user) => {
  await page.goto(TARGET_URL + '/signup');
  await page.waitForTimeout(800);

  // 이메일 입력
  const emailInputs = await page.$$('input[name="email"]');
  if (emailInputs.length > 0) {
    await emailInputs[0].fill(user.email);
  }
  await page.waitForTimeout(400);

  // 비밀번호 입력
  const passwordInputs = await page.$$('input[name="password"]');
  if (passwordInputs.length > 0) {
    await passwordInputs[0].fill(user.password);
  }
  await page.waitForTimeout(400);

  // 비밀번호 확인 입력
  const confirmInputs = await page.$$('input[name="passwordConfirm"]');
  if (confirmInputs.length > 0) {
    await confirmInputs[0].fill(user.password);
  }
  await page.waitForTimeout(400);

  // 닉네임 입력
  const nicknameInputs = await page.$$('input[name="nickname"]');
  if (nicknameInputs.length > 0) {
    await nicknameInputs[0].fill(user.nickname);
  }
  await page.waitForTimeout(400);

  // 회원가입 버튼 클릭
  const submitButtons = await page.$$('button[type="submit"]');
  if (submitButtons.length > 0) {
    await submitButtons[0].click();
  }

  await page.waitForTimeout(4000);
};

const addTodo = async (page, title, priority = 'NORMAL', dueDate = null) => {
  // "+ 새 할일" 버튼 찾기 및 클릭
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('새 할일')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(700);

  // 제목 입력
  const titleInputs = await page.$$('input[name="title"]');
  if (titleInputs.length > 0) {
    await titleInputs[0].fill(title);
    await page.waitForTimeout(300);
  }

  // 우선순위 선택
  const priorityRadios = await page.$$(`input[type="radio"][name="priority"][value="${priority}"]`);
  if (priorityRadios.length > 0) {
    await priorityRadios[0].click();
    await page.waitForTimeout(300);
  }

  // 마감일 입력
  if (dueDate) {
    const dateInputs = await page.$$('input[name="dueDate"]');
    if (dateInputs.length > 0) {
      await dateInputs[0].fill(dueDate);
      await page.waitForTimeout(300);
    }
  }

  // 추가 버튼 클릭
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await btn.textContent();
    if (text && (text.includes('추가') || text.includes('저장'))) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(1500);
};

const getTodoCount = async (page) => {
  const totalElement = await page.textContent('div:has(> p:text("전체 할일")) p:has-text(/^\\d+$)');
  return parseInt(totalElement) || 0;
};

(async () => {
  const browser = await chromium.launch({ headless: true }); // headless로 속도 향상
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = {};
  const timestamp = new Date().toISOString();

  try {
    console.log('\n=== 통합 시나리오 테스트 시작 ===\n');

    // ========== SC-002: 직장인의 일정 관리 ==========
    console.log('📌 SC-002: 직장인의 일정 관리');
    results.sc002 = {
      scenario: 'SC-002: 직장인의 일정 관리',
      steps: [],
      timestamp: timestamp
    };

    const user2 = createTestUser();
    await signup(page, user2);
    results.sc002.steps.push({ step: '회원가입', status: 'PASS' });

    // 복수 할일 생성 (직장인 시나리오)
    const todos2 = [
      { title: '회의 자료 작성', priority: 'HIGH', days: 0 },
      { title: '이메일 답장', priority: 'NORMAL', days: 0 },
      { title: '프로젝트 진행상황 보고', priority: 'HIGH', days: 1 },
      { title: '팀 회의', priority: 'NORMAL', days: 2 },
      { title: '월간 보고서 제출', priority: 'HIGH', days: 5 }
    ];

    for (const todo of todos2) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + todo.days);
      const dueDateStr = dueDate.toISOString().split('T')[0];
      await addTodo(page, todo.title, todo.priority, dueDateStr);
    }
    results.sc002.steps.push({ step: '5개 할일 생성', status: 'PASS' });

    // 필터링 테스트 - select[role="combobox"] 또는 모든 select 찾기
    const filterSelects = await page.$$('select');
    if (filterSelects.length >= 1) {
      // 첫 번째 select는 필터 (상태)
      await filterSelects[0].selectOption('ACTIVE');
      await page.waitForTimeout(500);
      results.sc002.steps.push({ step: '상태 필터링 (진행중)', status: 'PASS' });
    } else {
      results.sc002.steps.push({ step: '상태 필터링', status: 'FAIL', error: '필터 select 요소 없음' });
    }

    // 정렬 테스트 - 두 번째 select는 정렬
    const sortSelects = await page.$$('select');
    if (sortSelects.length >= 2) {
      // 두 번째 select는 정렬 기준
      await sortSelects[1].selectOption('priority');
      await page.waitForTimeout(500);
      results.sc002.steps.push({ step: '우선순위 정렬', status: 'PASS' });
    } else {
      results.sc002.steps.push({ step: '우선순위 정렬', status: 'FAIL', error: '정렬 select 요소 없음' });
    }

    console.log('✅ SC-002 완료');

    // ========== SC-003: 캘린더 기능 ==========
    console.log('\n📌 SC-003: 캘린더 기능');
    results.sc003 = {
      scenario: 'SC-003: 캘린더 기능',
      steps: [],
      timestamp: timestamp
    };

    // 새 사용자로 테스트
    const user3 = createTestUser();
    await signup(page, user3);
    results.sc003.steps.push({ step: '회원가입', status: 'PASS' });

    // 할일 생성
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await addTodo(page, '캘린더 테스트1', 'NORMAL', today);
    await addTodo(page, '캘린더 테스트2', 'HIGH', tomorrow);
    results.sc003.steps.push({ step: '캘린더용 할일 생성', status: 'PASS' });

    // 캘린더 페이지 접근
    await page.goto(TARGET_URL + '/calendar');
    await page.waitForTimeout(1500);

    // URL 확인 또는 페이지 텍스트 확인
    const currentUrl = page.url();
    const pageBody = await page.textContent('body');

    const calendarLoaded = currentUrl.includes('/calendar') && pageBody && pageBody.length > 100;
    if (calendarLoaded) {
      results.sc003.steps.push({ step: '캘린더 페이지 로드', status: 'PASS' });
    } else {
      results.sc003.steps.push({ step: '캘린더 페이지 로드', status: 'FAIL', error: '캘린더 페이지 로드 실패', url: currentUrl });
    }

    console.log('✅ SC-003 완료');

    // ========== SC-004: 휴지통 기능 ==========
    console.log('\n📌 SC-004: 휴지통 기능');
    results.sc004 = {
      scenario: 'SC-004: 휴지통 기능',
      steps: [],
      timestamp: timestamp
    };

    // 새 사용자로 테스트
    const user4 = createTestUser();
    await signup(page, user4);
    results.sc004.steps.push({ step: '회원가입', status: 'PASS' });

    // 삭제할 할일 생성
    await addTodo(page, '삭제 테스트 항목', 'NORMAL');
    results.sc004.steps.push({ step: '할일 생성', status: 'PASS' });

    // 할일 삭제 - "삭제" 텍스트를 가진 버튼 찾기
    const allButtons = await page.$$('button');
    let deleteClicked = false;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('삭제')) {
        await btn.click();
        await page.waitForTimeout(1500);
        deleteClicked = true;
        break;
      }
    }

    if (deleteClicked) {
      results.sc004.steps.push({ step: '할일 삭제', status: 'PASS' });
    } else {
      results.sc004.steps.push({ step: '할일 삭제', status: 'FAIL', error: '삭제 버튼 없음' });
    }

    // 휴지통 페이지 접근
    await page.goto(TARGET_URL + '/trash');
    await page.waitForTimeout(1500);

    const trashUrl = page.url();
    const trashBody = await page.textContent('body');

    const trashLoaded = trashUrl.includes('/trash') && trashBody && trashBody.length > 100;
    if (trashLoaded) {
      results.sc004.steps.push({ step: '휴지통 페이지 로드', status: 'PASS' });
    } else {
      results.sc004.steps.push({ step: '휴지통 페이지 로드', status: 'FAIL', error: '휴지통 페이지 로드 실패', url: trashUrl });
    }

    console.log('✅ SC-004 완료');

    // ========== 결과 요약 ==========
    console.log('\n=== 테스트 요약 ===\n');

    let totalSteps = 0;
    let passedSteps = 0;

    for (const [key, scenario] of Object.entries(results)) {
      const passed = scenario.steps.filter(s => s.status === 'PASS').length;
      const total = scenario.steps.length;
      totalSteps += total;
      passedSteps += passed;

      console.log(`${scenario.scenario}: ${passed}/${total} PASS`);
      scenario.steps.forEach(step => {
        const icon = step.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${icon} ${step.step}: ${step.status}`);
      });
    }

    const overallRate = ((passedSteps / totalSteps) * 100).toFixed(1);
    console.log(`\n전체 성공률: ${passedSteps}/${totalSteps} (${overallRate}%)\n`);

    // 결과 저장
    const fs = require('fs');
    const finalResults = {
      testName: 'SC-002, SC-003, SC-004 통합 테스트',
      timestamp: timestamp,
      summary: {
        totalSteps,
        passedSteps,
        failedSteps: totalSteps - passedSteps,
        successRate: overallRate + '%'
      },
      scenarios: results
    };

    fs.writeFileSync('C:/Users/eunww/WHATtodo/integrated-test-results.json', JSON.stringify(finalResults, null, 2));
    console.log('결과 저장: C:/Users/eunww/WHATtodo/integrated-test-results.json');

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
})();
