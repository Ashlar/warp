import Arweave from 'arweave';
import { LoggerFactory, mapReplacer } from '../src';
import { TsLogFactory } from '../src/logging/node/TsLogFactory';
import fs from 'fs';
import path from 'path';
import { SmartWeaveWebFactory } from '../src/core/web/SmartWeaveWebFactory';

async function main() {
  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel('debug');

  const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: 'https', // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false // Enable network request logging
  });

  const contractTxId = 'LppT1p3wri4FCKzW5buohsjWxpJHC58_rgIO-rYTMB8';

  const smartweave = SmartWeaveWebFactory.memCached(arweave);

  const contract = smartweave.contract(contractTxId)
    .setEvaluationOptions({
      ignoreExceptions: false,
      stackTrace: {
        saveState: false
      }
    });

  const { state, validity } = await contract.readState();

  const callStack = contract.getCallStack();

  fs.writeFileSync(path.join(__dirname, 'data', 'call_stack.json'), JSON.stringify(callStack, mapReplacer));
}

main().catch((e) => console.error(e));
