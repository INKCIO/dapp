#! /usr/bin/env node

import * as commander from 'commander';

let args: { rpc: string, port: number } = <any>commander.version('1.0')
    .option('--rpc <addr>', 'ETH RPC address', 'http://localhost:8545')
    .option('--port [number]', 'Listening port', 5002)
    .parse(process.argv);
