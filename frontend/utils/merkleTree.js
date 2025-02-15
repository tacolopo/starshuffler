import { buildPoseidon } from 'circomlibjs';

class MerkleTree {
  constructor(levels = 20) {
    this.levels = levels;
    this.capacity = 2 ** levels;
    this.nodes = new Array(this.capacity * 2).fill(BigInt(0));
    this.zeros = null;
    this.poseidon = null;
  }

  async initialize() {
    // Initialize Poseidon
    this.poseidon = await buildPoseidon();
    
    // Calculate zero values for each level
    this.zeros = new Array(this.levels + 1);
    this.zeros[0] = BigInt(0);
    for (let i = 1; i <= this.levels; i++) {
      this.zeros[i] = this.hashPair(this.zeros[i-1], this.zeros[i-1]);
    }

    // Initialize the tree with zero values
    for (let i = 0; i < this.capacity * 2; i++) {
      if (i >= this.capacity) {
        this.nodes[i] = this.zeros[0];
      } else {
        const level = Math.floor(Math.log2(i + 1));
        this.nodes[i] = this.zeros[level];
      }
    }
  }

  hashPair(left, right) {
    const hash = this.poseidon([left, right]);
    return this.poseidon.F.toString(hash);
  }

  insert(leaf) {
    let index = this.nextIndex();
    if (index === -1) throw new Error('Tree is full');

    // Convert leaf to BigInt if it's not already
    leaf = BigInt(leaf);

    // Insert the leaf
    let current = index + this.capacity;
    this.nodes[current] = leaf;

    // Calculate path to root
    for (let i = 0; i < this.levels; i++) {
      current = Math.floor((current - 1) / 2);
      const left = this.nodes[current * 2 + 1];
      const right = this.nodes[current * 2 + 2];
      this.nodes[current] = BigInt(this.hashPair(left, right));
    }

    return index;
  }

  generateProof(index) {
    if (index < 0 || index >= this.capacity) {
      throw new Error('Index out of bounds');
    }

    const pathElements = [];
    const pathIndices = [];

    // Calculate path
    let current = index + this.capacity;
    for (let i = 0; i < this.levels; i++) {
      const isRight = current % 2 === 1;
      const sibling = isRight ? current - 1 : current + 1;
      
      // Use zero value if sibling is out of bounds
      const siblingValue = sibling < this.nodes.length ? 
        this.nodes[sibling] : 
        this.zeros[Math.floor(Math.log2(sibling - this.capacity + 1))];
      
      pathElements.push(siblingValue.toString());
      pathIndices.push(isRight ? 0 : 1);
      
      current = Math.floor((current - 1) / 2);
    }

    return {
      pathElements,
      pathIndices,
      root: this.getRoot().toString()
    };
  }

  getRoot() {
    return this.nodes[1];
  }

  nextIndex() {
    for (let i = 0; i < this.capacity; i++) {
      const node = this.nodes[i + this.capacity];
      if (node.toString() === this.zeros[0].toString()) {
        return i;
      }
    }
    return -1;
  }
}

export const createMerkleProof = async (commitment, allCommitments) => {
  const tree = new MerkleTree();
  await tree.initialize();
  
  // Insert all commitments
  for (const comm of allCommitments) {
    tree.insert(comm);
  }
  
  // Find index of our commitment
  const index = allCommitments.indexOf(commitment);
  if (index === -1) {
    throw new Error('Commitment not found in tree');
  }
  
  // Generate proof
  return tree.generateProof(index);
}; 