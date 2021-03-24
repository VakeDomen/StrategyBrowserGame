
interface Node<T> {
    key: number
    value: T
}
export class PriorityQueue<T> {
    heap: Node<T>[] = []
  
    left(index: number) { return 2 * index + 1 };
    right(index: number) { return  2 * index + 2 };
    hasLeft(index: number) { return this.left(index) < this.heap.length };
    hasRight(index: number) { return this.right(index) < this.heap.length };
    swap(a: number, b: number) {
      const tmp = this.heap[a]
      this.heap[a] = this.heap[b]
      this.heap[b] = tmp
    }
    /** */
  
    pop() {
        if(this.heap.length == 0) return null
        
        this.swap(0, this.heap.length - 1);
        const item = this.heap.pop();

        let current = 0
        while(this.hasLeft(current)) {
            let smallerChild = this.left(current);
            if(this.hasRight(current) && this.heap[this.right(current)].key < this.heap[this.left(current)].key){
                smallerChild = this.right(current)
            }
            if(this.heap[smallerChild].key > this.heap[current].key) break;
            this.swap(current, smallerChild)
            current = smallerChild
        }
        return item ? item.value : undefined;
      }

}