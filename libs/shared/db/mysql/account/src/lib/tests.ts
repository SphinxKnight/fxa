/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import path from 'path';
import { Kysely, sql } from 'kysely';

import { DB, setupAccountDatabase } from '@fxa/shared/db/mysql/account';

const TEST_DB = 'testAccount';
const SQL_FILE_LOCATION = '../test';

export type ACCOUNT_TABLES = 'accounts' | 'carts' | 'emails';

export async function testAccountDatabaseSetup(
  tables: ACCOUNT_TABLES[]
): Promise<Kysely<DB>> {
  // Create the db if it doesn't exist
  let db = await setupAccountDatabase({
    host: 'localhost',
    database: '',
    password: '',
    port: 3306,
    user: 'root',
  });

  await sql`DROP DATABASE IF EXISTS ${sql.table(TEST_DB)}`.execute(db);
  await sql`CREATE DATABASE ${sql.table(TEST_DB)}`.execute(db);
  await db.destroy();

  db = await setupAccountDatabase({
    host: 'localhost',
    database: TEST_DB,
    password: '',
    port: 3306,
    user: 'root',
  });

  await runSql(
    db,
    tables.map((x) => `${SQL_FILE_LOCATION}/${x}.sql`)
  );

  return db;
}

async function runSql(db: Kysely<DB>, filePaths: string[]) {
  return Promise.all(
    filePaths
      .map((x) => path.join(__dirname, x))
      .map((x) => fs.readFileSync(x, 'utf8'))
      .map((x) => sql`${sql.raw(x)}`.execute(db))
  );
}
