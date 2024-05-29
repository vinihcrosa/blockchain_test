import { createHash, isHashProofed } from "./helpers";

export interface Block {
  header: {
    nonce: number;
    hash: string;
  },
  payload: {
    sequence: number;
    timestamp: number;
    data: any;
    previousHash: string;
  }
}

export class Blockchain {
  #chain: Block[] = [];
  private prefixPow = '0';

  constructor(private difficulty= 4) {
    this.#chain.push(this.createGenesisBlock());
  }

  get chain(): Block[] {
    return this.#chain;
  }

  private createGenesisBlock(): Block {
    const payload: Block['payload'] = {
      sequence: 0,
      timestamp: Date.now(),
      data: 'Genesis Block',
      previousHash: '',
    }
    return {
      header: {
        nonce: 0,
        hash: createHash(JSON.stringify(payload)),
      },
      payload
    }
  }

  private get lastBlock(): Block {
    return this.#chain.at(-1) as Block;
  }

  private getPreviousBlockHash(): string {
    return this.lastBlock.header.hash;
  }

  createBlock(data: any): Block['payload'] {
    const newBlock: Block['payload'] = {
      sequence: this.lastBlock.payload.sequence + 1,
      timestamp: Date.now(),
      data,
      previousHash: this.getPreviousBlockHash(),
    }
    return newBlock;
  }

  mineBlock(block: Block['payload']): {block: Block} {
    let hash = '';
    let nonce = 0;
    console.time(`⛏️ Mining time for block #${block.sequence}`);
    do {
      hash = createHash(JSON.stringify(block) + nonce);
      nonce++;
    } while (!hash.startsWith(this.prefixPow.repeat(this.difficulty)));
    console.timeEnd(`⛏️ Mining time for block #${block.sequence}`);
    return {
      block: {
        header: {
          nonce,
          hash,
        },
        payload: block,
      }
    }
  }

  sendBlockToChain(block: Block): Block[] {
    this.#chain.push(block);
    return this.#chain;
  }

  verifyBlock(block: Block): boolean {
    if (block.payload.previousHash !== this.getPreviousBlockHash()) {
      console.error(`Invalid block #${block.payload.sequence}: Previous block hash is "${this.getPreviousBlockHash().slice(0, 12)}" not "${block.payload.previousHash.slice(0, 12)}"`)
      return false
    }

    if (!isHashProofed({
      hash: createHash(createHash(JSON.stringify(block.payload)) + block.header.nonce),
      difficulty: this.difficulty,
      prefix: this.prefixPow
    })) {
      console.error(`Invalid block #${block.payload.sequence}: Hash is not proofed, nonce ${block.header.nonce} is not valid`)
      return false
    }

    return true
  }
}