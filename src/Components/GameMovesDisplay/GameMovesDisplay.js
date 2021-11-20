import Style from '../styles.css'
import {Node} from '../../Services/moveTree'
export function GameMovesDisplay(props){
   return (
      <div className = 'gameMovesContainer'>
            <MoveTree node = {props.moves} key = {props.moves.value}/>
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
      console.log(currentNode.value);
      elements[elements.length] = <span key = {currentNode.value}>{currentNode.value}</span>;
      currentNode = currentNode.getChildren()[0];
   }
   let tmp = [];
   if(currentNode && currentNode.getChildren().length > 1){
      
      tmp = currentNode.getChildren().map(
         (element) =>{
            return <MoveTree node={element} key ={element.value}/>
         }
      );
   }
   return [elements.length != 0 && <div>{elements}</div>].concat(tmp);
}