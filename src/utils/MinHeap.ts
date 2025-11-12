export interface HeapNode<T> {
  priority: number;
  data: T;
}

export class MinHeap<T> {
  private heap: HeapNode<T>[] = [];

  constructor() {
    this.heap = [];
  }

  public push(priority: number, data: T): void {
    this.heap.push({ priority, data });
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): HeapNode<T> | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  public peek(): HeapNode<T> | undefined {
    return this.heap[0];
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.heap[index].priority >= this.heap[parentIndex].priority) {
        break;
      }

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}