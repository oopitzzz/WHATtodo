/**
 * 30일 이상 경과한 할일을 자동으로 삭제하는 스케줄러
 * 매일 자정에 실행됨
 */

const { pool } = require('../db');

/**
 * 30일 이상 경과한 삭제된 할일 자동 삭제
 * @returns {Promise<{deletedCount: number, timestamp: Date}>}
 */
async function autoDeleteExpiredTrash() {
  try {
    const query = `
      DELETE FROM todos
      WHERE deleted_at IS NOT NULL
        AND deleted_at <= NOW() - INTERVAL '30 days'
      RETURNING todo_id
    `;
    const result = await pool.query(query);
    const deletedCount = result.rows.length;

    console.log(`[Scheduler] Deleted ${deletedCount} expired todos at ${new Date().toISOString()}`);

    return {
      success: true,
      deletedCount,
      timestamp: new Date(),
      message: `Successfully deleted ${deletedCount} expired todos`
    };
  } catch (error) {
    console.error('[Scheduler Error]', error);
    return {
      success: false,
      deletedCount: 0,
      timestamp: new Date(),
      error: error.message
    };
  }
}

/**
 * 스케줄러 시작 (매일 자정에 실행)
 * 실제 배포 환경에서는 별도 스케줄러(node-cron, node-schedule 등)를 사용하는 것을 권장
 * @param {number} intervalHours - 실행 간격 (시간 단위, 기본값: 24시간)
 */
function startAutoDeleteScheduler(intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  // 매일 자정에 가장 가깝게 시작
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // 다음날 자정
  const delayMs = nextMidnight.getTime() - now.getTime();

  console.log(`[Scheduler] Scheduled to run in ${Math.round(delayMs / 1000 / 60)} minutes`);

  // 첫 실행은 다음 자정까지 대기, 이후 매 intervalHours마다 실행
  setTimeout(() => {
    autoDeleteExpiredTrash();
    setInterval(() => {
      autoDeleteExpiredTrash();
    }, intervalMs);
  }, delayMs);
}

module.exports = {
  autoDeleteExpiredTrash,
  startAutoDeleteScheduler
};
