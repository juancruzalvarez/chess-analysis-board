const getFirstChildren = (node)=>{
   return node.getChildren()[0];
}

export function GameMovesDisplay(props){
   let keyNumber = 0;
   let elements = [];
   let parent = props.moves;
   let currentNode = getFirstChildren(props.moves);
   let nodeNumber = currentNode && Math.floor(currentNode.position.halfMoves/2);

   while(currentNode){
      if(nodeNumber%2 === 0){
         elements[elements.length] = <span key={keyNumber++} className = 'index' >{nodeNumber/2}</span>;
      }
      let id = currentNode.id;
      let pos = currentNode.position;
      elements[elements.length] = <span  onClick = {()=>props.onClickNode(id, pos)} key={keyNumber++} className = 'move'>{currentNode.move}</span>;
      if(parent.getChildren().length>1){
         if(nodeNumber%2 === 0){
            elements[elements.length] = <span key={keyNumber++} className = 'move'>...</span>;
            let tmp = [];
            tmp = parent.getChildren().slice();
            tmp.splice(0,1);
            tmp = tmp.map((element, index)=>  <SecundaryLinesDisplay node = {element} key = {index} first = {true}/>);
            elements[elements.length] = <div key={keyNumber++} className  = 'lineContainer'>{tmp}</div> ;
            elements[elements.length] = <span key={keyNumber++} className = 'index'>{nodeNumber/2}</span>;
            elements[elements.length] = <span key={keyNumber++} className = 'move'>...</span>;
         }else{
            let tmp = [];
            tmp = parent.getChildren().slice();
            tmp.splice(0,1);
            tmp = tmp.map((element, index)=> <SecundaryLinesDisplay node = {element} key = {index} first = {true}/>);
            elements[elements.length] = <div key={keyNumber++} className  = 'lineContainer'>{tmp}</div> ;
         }
      }
      parent = currentNode;
      currentNode = currentNode.getChildren()[0];
      nodeNumber++;
   }
   return (<div className = 'gameMovesContainer'>
           {elements}
   </div>);
}




//recursivly displays the tree.
const SecundaryLinesDisplay = (props) =>{
   let elements = [];
   let currentNode = props.node;
   let keyNumber = 0;
   while(currentNode && currentNode.getChildren().length < 2){
      let str = currentNode.position.halfMoves%2 === 1 ? (Math.floor(currentNode.position.halfMoves/2)+1 +'.') :'';
      str += currentNode.move;
      elements[elements.length] = <span key = {keyNumber++}> {str}</span>
      currentNode = currentNode.getChildren()[0];
   }
   if(currentNode){elements[elements.length] = <span key = {keyNumber++}>{currentNode.move} </span>;}
   let tmp = [];
   if(currentNode && currentNode.getChildren().length > 1){
      
      tmp = currentNode.getChildren().map(
         (element) =>{
            return <SecundaryLinesDisplay key = {keyNumber++} node={element} first = {false}/>
         }
      );
   }
   return [elements.length !== 0 && <div className = 'line' key = {keyNumber++}>{elements.concat(tmp)}</div>];
}