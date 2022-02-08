export function Node (id, move, position){
   this.id = id;
   this.move = move;
   this.position = position;
   this.children = [];
   this.addChildren = (node) =>{
      this.children[this.children.length] = node;
   }
   this.getChildren = () =>{return this.children}
}

export const searchNode = (id, tree) =>{
      if(tree.id === id){
           return tree;
      }else if (tree.getChildren().length>0){
           var i;
           var result = null;
           for(i=0; result == null && i < tree.children.length; i++){
                result = searchNode(tree.getChildren()[i], id);
           }
           return result;
      }
      return null;

}

export const  insertNode = (node, parentId, newNode) => {
   if (node.id === parentId) {
       if (newNode) {
           node.addChildren(newNode);
       }

   } else if (node.getChildren().length>0) {
       for (let i = 0; i < node.getChildren().length; i++) {
           insertNode(node.getChildren()[i], parentId, newNode);
       }
   }
}

export const getParent = (node, nodeId) =>{
    for (let i = 0; i < node.getChildren().length; i++) {
        if(node.getChildren()[i].id === nodeId){
            return node;
        } 
    }
    let result = null;
    for (let i = 0; (i < node.getChildren().length) && result === null; i++) {
        result = getParent(node.getChildren()[i], nodeId);
    }
    return result;

}