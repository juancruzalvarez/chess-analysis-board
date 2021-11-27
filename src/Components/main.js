import {useState, useRef} from 'react'
//eslint-disable-next-line
import Style from './styles.css'
import { startPosition, isMoveValid, performMove } from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'
import {Node} from  '../Services/moveTree'
import { EngineEvaluation } from './EngineEvaluation/EngineEvaluation';
import {cloneDeep} from 'lodash';

export const Analysis = (props) =>{
   let root = new Node('', 0);
   let e4 = new Node('e4',1);
   let e5 = new Node('e5',2);
   let nf3 = new Node('nf3',3);
   let nc3 = new Node('nc3',3);
   let nc6 = new Node('nc6',4);
   let nf6 = new Node('nf6',4);
   let nxe5 = new Node('nxe5',5);
   let nxe4 = new Node('nxe4',6);
   let e6 = new Node('e6', 6);
   let qe2 = new Node('qe2', 7);
   let d4 = new Node('e4', 7);
   let nf33 = new Node('nf3', 7);
      
   nc3.addChildren(nc6);
   nxe4.addChildren(qe2);
   nxe4.addChildren(d4);
   e6.addChildren(nf33);
   nxe5.addChildren(e6);
   nxe5.addChildren(nxe4);
   nf6.addChildren(nxe5);
   nf3.addChildren(nf6);
   e5.addChildren(nf3);
   e5.addChildren(nc3);
   e4.addChildren(e5);
   root.addChildren(e4);   
   const [position, setPosition] = useState(startPosition);
   const [moveTree, setMoveTree] = useState(root);
   const [selectedSquare, setSelectedSquare] = useState(null);
   const [grabbedPiece, setGrabbedPiece] = useState(null);
   const [mousePosition, setMousePosition] = useState({x:0,y:0});
   const boardRef = useRef();


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
         setGrabbedPiece(document.getElementById(index));
      }
   }

   const handleOnMouseUp = (e) =>{
      let index = getBoardSquare(e.clientX, e.clientY);
      if(isMoveValid(position,selectedSquare, index)){
         let newPosition = cloneDeep(position);
         performMove(newPosition, selectedSquare, index);
         setPosition(newPosition);
      }
      setSelectedSquare(null);
      setGrabbedPiece(null);
   }

   const handleOnMouseMove = (e)=>{
      setMousePosition({x:e.clientX, y:e.clientY});
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

         <GameMovesDisplay moves = {moveTree}/>

      </div>
         
   </div>
   );
}