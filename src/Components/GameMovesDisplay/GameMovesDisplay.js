import Style from '../styles.css'
import {Node} from '../../Services/moveTree'
export function GameMovesDisplay(props){
   let currentNode = props.moves;
   let moveNumber = 1;
   let whiteMove;
   let blackMove;
   while(currentNode){
      whiteMove = currentNode.move;
      blackMove = '';
      if(currentNode.getChildren().length > 1){

      }

      currentNode = currentNode.getChildren()[0];
   }
}

(<div className = 'gameMovesContainer'>
           
</div>)
<SecundaryLinesDisplay node = {props.moves} indentationLevel = {1} key = {props.moves.value}/>

const MainLineRowDisplay = (props) =>{
   return (
      <div className = 'mainLineRowDisplay'>
         <span>{props.moveNumber}</span>
         <span>{props.whiteMove ? props.whiteMove : '...'}</span>
         <span>{props.blackMove ? props.blackMove : '...'}</span>
      </div>
   );
}

//recursivly displays the tree.
const SecundaryLinesDisplay = (props) =>{
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
            return <SecundaryLinesDisplay node={element} key ={element.move}/>
         }
      );
   }
   return [elements.length !== 0 && <div className = 'line' key = {elements[0].move + currentNode}>{elements.concat(tmp)}</div>];
}