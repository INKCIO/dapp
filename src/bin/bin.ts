#! /usr/bin/env node

import * as commander from 'commander';
import * as cluster from 'cluster';
import * as os from 'os';

let args: { rpc: string, port: number } = <any>commander.version('1.0')
    .option('--rpc <addr>', 'ETH RPC address', 'http://localhost:8545')
    .option('--port [number]', 'Listening port', 5002)
    .parse(process.argv);


function fork() {
    let worker = cluster.fork(process.env);
    worker.once('exit', (code, signal) => {
        fork();
    });
}

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        fork();
    }
}