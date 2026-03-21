module.exports = {
  apps: [
    {
      name: 'feriwala-api',
      script: 'src/server.js',
      cwd: '/home/bitnami/feriwala/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '500M',
      error_file: '/home/bitnami/feriwala/logs/api-error.log',
      out_file: '/home/bitnami/feriwala/logs/api-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
};
