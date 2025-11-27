const { Pool } = require('pg');
const dns = require('dns');

// IPv6 비활성화 (IPv4만 사용)
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: 'postgresql://postgres:superuser@db.dqhvtmphokkfocxeyjur.supabase.co:5432/postgres',
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

(async () => {
  try {
    console.log('Supabase 연결 테스트 중... (IPv4 우선)');
    const client = await pool.connect();
    console.log('✅ Supabase 연결 성공!');
    
    const result = await client.query('SELECT NOW();');
    console.log('✓ 시간:', result.rows[0].now);
    
    client.release();
    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ 연결 실패:', err.message);
    process.exit(1);
  }
})();
