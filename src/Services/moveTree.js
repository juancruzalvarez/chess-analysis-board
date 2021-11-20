export function Node (value){
   this.value = value;
   this.children = [];
   this.addChildren = (node) =>{
      this.children[this.children.length] = node;
   }
   this.getChildren = () =>{return [...this.children]}
}