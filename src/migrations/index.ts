import * as migration_20261031_192433_initial from './20261031_192433_initial';

export const migrations = [
  {
    up: migration_20261031_192433_initial.up,
    down: migration_20261031_192433_initial.down,
    name: '20261031_192433_initial'
  },
];
