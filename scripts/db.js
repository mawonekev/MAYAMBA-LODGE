const { default: EmbeddedPostgres } = require('embedded-postgres');
const path = require('path');
const fs = require('fs');

const pg = new EmbeddedPostgres({
  port: 5432,
  databaseDir: path.resolve(__dirname, '../.pg-data'),
  user: 'postgres',
  password: 'password'
});

async function main() {
  const cmd = process.argv[2] || 'start';
  if (cmd === 'start') {
    if (!fs.existsSync(path.resolve(__dirname, '../.pg-data'))) {
      console.log('Initializing embedded postgres cluster in .pg-data...');
      await pg.initialise();
    }
    try {
      await pg.start();
      console.log('Embedded Postgres started on port 5432');
    } catch (e) {
      if (e.message && e.message.includes('already')) {
        console.log('Postgres is already running');
      } else {
        console.log('Postgres start status:', e.message);
      }
    }
    try {
      await pg.createDatabase('mayamba');
      console.log('Database mayamba ensured');
    } catch (e) {
      // Database might already exist
    }
  } else if (cmd === 'stop') {
    await pg.stop();
    console.log('Embedded Postgres stopped');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Embedded Postgres error:', err);
    process.exit(1);
  });
}

module.exports = { pg };
