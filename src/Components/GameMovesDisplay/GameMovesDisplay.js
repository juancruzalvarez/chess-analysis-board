import Style from '../styles.css'
import {Node} from '../../Services/moveTree'
export function GameMovesDisplay(props){
   return (
      <div className = 'gameMovesContainer'>
            <MoveTree node = {props.moves} indentationLevel = {1} key = {props.moves.value}/>
      </div>
   );
}

const MoveDisplay = (props) =>{
   return props.moveNumber%2 === 0 ? [<span className = 'moveDisplay'> {`${Math.floor(props.moveNumber/2)+1}`}</span>, <span className = 'moveDisplay'> {props.move}</span>] : <span className = 'moveDisplay'> {props.move}</span>;
}

//recursivly displays the tree.
const MoveTree = (props) =>{
   let elements = [];
   let currentNode = props.node;
   while(currentNode && currentNode.getChildren().length < 2){
      if(currentNode.moveNumber%2 ===0){
         elements[elements.length] = <span key = {currentNode.move+currentNode.moveNumber/2}> {(currentNode.moveNumber/2)+1 + '.'}</span>
      }
      elements[elements.length] = <span key = {currentNode.move+currentNode.moveNumber}>{currentNode.move} </span>;
      currentNode = currentNode.getChildren()[0];
   }
   if(currentNode){elements[elements.length] = <span key = {currentNode.value}>{currentNode.move} </span>;}
   let tmp = [];
   if(currentNode && currentNode.getChildren().length > 1){
      
      tmp = currentNode.getChildren().map(
         (element) =>{
            return <MoveTree node={element} key ={element.move}/>
         }
      );
   }
   return [elements.length !== 0 && <div className = 'line' key = {elements[0].move + currentNode}>{elements.concat(tmp)}</div>];
}