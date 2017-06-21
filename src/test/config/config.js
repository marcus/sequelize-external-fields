module.exports = {

  postgres: {
    database: process.env.SEQ_PG_DB   || 'external_fields_test',
    username: process.env.SEQ_PG_USER || 'root',
    password: process.env.SEQ_PG_PW   || null,
    host:     process.env.SEQ_PG_HOST || '127.0.0.1',
    port:     process.env.SEQ_PG_PORT || 5432,
    pool:     {
      maxConnections: process.env.SEQ_PG_POOL_MAX  || process.env.SEQ_POOL_MAX  || 5,
      maxIdleTime:    process.env.SEQ_PG_POOL_IDLE || process.env.SEQ_POOL_IDLE || 3000
    }
  },

};
