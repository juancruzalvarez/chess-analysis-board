export function Node (move, moveNumber){
   this.move = move;
   this.moveNumber = moveNumber;
   this.children = [];
   this.addChildren = (node) =>{
      this.children[this.children.length] = node;
   }
   this.getChildren = () =>{return [...this.children]}
}