import {useState, useRef, useEffect} from 'react'
//eslint-disable-next-line
import Style from './styles.css'
import { startPosition, isMoveValid, performMove, getPositionFromFEN, squareNotationToIndex, indexToSquareNotation, getFENfromPosition, moveType} from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'
import {Node, searchNode, insertNode} from  '../Services/moveTree'
import { EngineEvaluation } from './EngineEvaluation/EngineEvaluation';
import {cloneDeep} from 'lodash';


export const Analysis = (props) =>{
   
   const [position, setPosition] = useState(startPosition);
   const [moveTree, setMoveTree] = useState(new Node(0, '', startPosition));
   const [selectedSquare, setSelectedSquare] = useState(null);
   const [mousePosition, setMousePosition] = useState({x:0,y:0});
   const [currentNodeID, setCurrentNodeID] = useState(0);
   const [newNodeID, setNewNodeID] = useState(1);
   const boardRef = useRef();

   const upHandler = () =>{
      console.log(moveTree);
   }
   useEffect(() => {
      window.addEventListener("keyup", upHandler);
      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener("keyup", upHandler);
      };
    }, []);
   const getBoardSquare = (clientX, clientY) =>{
      const boardElement = boardRef.current;
      const boundingRect = boardElement.getBoundingClientRect();
      let x = Math.floor(8 * ( (clientX-boundingRect.left)/boundingRect.width ) );
      let y = Math.floor(8 * ( (clientY-boundingRect.top)/boundingRect.height ) );
      return y*8 + x;
   }
   
   const handleOnMouseDown = (e) =>{
      let index = getBoardSquare(e.clientX, e.clientY);
      if(position.board[index]){
         setSelectedSquare(index);
      }
   }

   const handleOnMouseUp = (e) =>{
      let index = getBoardSquare(e.clientX, e.clientY);
      if(isMoveValid(position,selectedSquare, index)){
         let newPosition = cloneDeep(position);
         let move = performMove(newPosition, selectedSquare, index);
         setPosition(newPosition);
         let newNode = new Node(newNodeID, move, newPosition);
         let newMoveTree = cloneDeep(moveTree);
         insertNode(newMoveTree, currentNodeID, newNode);
         setMoveTree(newMoveTree);
         setCurrentNodeID(newNodeID);
         setNewNodeID(newNodeID + 1);

      }
      setSelectedSquare(null);
   }

   const handleOnMouseMove = (e)=>{
      setMousePosition({x:e.clientX, y:e.clientY});
   }

   const handleOnClickNode = (clickedNodeId, clickedNodePosition) =>{
      setCurrentNodeID(clickedNodeId);
      setPosition(clickedNodePosition);
   }

   return (
   <div className ='mainContainer'>
      <div className = 'anotationContainer'></div>

      <Board 
         boardReference = {boardRef}
         board = {position.board}
         pieceSize = { boardRef.current && boardRef.current.getBoundingClientRect().width/8}
         grabbedPiece = {selectedSquare}
         mousePosition = {mousePosition}
         onMouseDown =  {handleOnMouseDown}
         onMouseMove = {handleOnMouseMove}
         onMouseUp = {handleOnMouseUp}
      /> 

      <div className = 'rightContainer'>

         <EngineEvaluation 
            eval = '+2.1' 
            line1 = '4.nf3 nf6 5.kg2 bc4 6.o-o ...' line2 = '4.qf3 bf3 5.ng2 kc4 6.o-o ...' line3 = '4.bf3 bf3 5.kg3 kc4 6.o-o-o ...' 
            line1Eval = '+2.4' line2Eval = '-2.1' line3Eval = '-0.2'
         />

         <GameMovesDisplay moves = {moveTree} onClickNode = {handleOnClickNode}/>

      </div>
         
   </div>
   );
}