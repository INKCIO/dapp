#! /usr/bin/env node

import * as commander from 'commander';

commander.version('0.0.1')
    .option('--rpc <addr>', 'ETH RPC Address', String)
    .parse(process.argv);

    