import { Blockchain } from './blockchain';

console.time('⛏️ create blockchain instance');

const difficulty = Number(process.env.DIFfICULTY) || 5;
const blockchain = new Blockchain(difficulty);

const numBlocks = Number(process.env.NUM_BLOCKS) || 50;
let chain = blockchain.chain;

for (let i = 0; i < numBlocks; i++) {
  const block = blockchain.createBlock(`Block ${i}`);
  const mineInfo = blockchain.mineBlock(block);
  chain = blockchain.sendBlockToChain(mineInfo.block);
}

console.timeEnd('⛏️ create blockchain instance');