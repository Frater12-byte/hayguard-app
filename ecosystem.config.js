// ecosystem.config.js - PM2 Configuration
module.exports = {
  apps: [{
    name: 'hayguard-api',
    script: './backend/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'frontend'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 3000,
    cwd: './',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};