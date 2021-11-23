import Style from '../styles.css'
import {Node} from '../../Services/moveTree'


export function GameMovesDisplay(props){
   let keyNumber = 0;
   let elements = [];
   let parent = props.moves;
   let currentNode = getFirstChildren(props.moves);
   let nodeNumber = 2;

   while(currentNode){
      if(nodeNumber%2 === 0){
         elements[elements.length] = <span key={keyNumber++} className = 'index' >{nodeNumber/2}</span>;
      }
      elements[elements.length] = <span key={keyNumber++} className = 'move'>{currentNode.move}</span>;
      if(parent.getChildren().length>1){
         if(nodeNumber%2 === 0){
            elements[elements.length] = <span key={keyNumber++} className = 'move'>...</span>;
            let tmp = [];
            tmp = parent.getChildren().slice();
            tmp.splice(0,1);
            tmp = tmp.map((element)=> <SecundaryLinesDisplay node = {element} moveNumber ={nodeNumber} first = {true}/>);
            console.log(tmp);
            elements[elements.length] = <div key={keyNumber++} className  = 'lineContainer'>{tmp}</div> ;
            elements[elements.length] = <span key={keyNumber++} className = 'index'>{nodeNumber/2}</span>;
            elements[elements.length] = <span key={keyNumber++} className = 'move'>...</span>;
         }else{
            let tmp = [];
            tmp = parent.getChildren().slice();
            tmp.splice(0,1);
            tmp = tmp.map((element)=> <SecundaryLinesDisplay node = {element} moveNumber ={nodeNumber} first = {true}/>);
            console.log(tmp);
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

const getFirstChildren = (node)=>{
   return node.getChildren()[0];
}


//recursivly displays the tree.
const SecundaryLinesDisplay = (props) =>{
   let elements = [];
   let currentNode = props.node;
   while(currentNode && currentNode.getChildren().length < 2){
      if(currentNode.moveNumber%2 === 1){
         elements[elements.length] = <span key = {currentNode.move+currentNode.moveNumber/2}> {Math.floor(currentNode.moveNumber/2)+1 + '.' + currentNode.move}</span>
      }
      currentNode = currentNode.getChildren()[0];
   }
   if(currentNode){elements[elements.length] = <span key = {currentNode.value}>{currentNode.move} </span>;}
   let tmp = [];
   if(currentNode && currentNode.getChildren().length > 1){
      
      tmp = currentNode.getChildren().map(
         (element) =>{
            return <SecundaryLinesDisplay node={element} key ={element.move} first = {false}/>
         }
      );
   }
   return [elements.length !== 0 && <div className = 'line' key = {elements[0].move + currentNode}>{elements.concat(tmp)}</div>];
}