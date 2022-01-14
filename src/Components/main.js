import {useState, useRef, useEffect} from 'react'
//eslint-disable-next-line
import Style from './styles.css'
import { startPosition, isMoveValid, performMove, getPositionFromFEN, squareNotationToIndex, indexToSquareNotation, getFENfromPosition, moveType, colors} from '../Services/chess';
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
   const [engineLines, setEngineLines] = useState([{score:'',line:''}, {score:'',line:''}, {score:'',line:''}]);
   const boardRef = useRef();
   const stockfishRef = useRef();
   useEffect(()=>{
      stockfishRef.current = new Worker("/stockfish.js");
      stockfishRef.current.onmessage = function(event) {
         let data = [];
         let depth;
         let score;
         let line;
         if(event.data){
            data = event.data.split(' ');
            if(data[0] === 'info'){
               depth = data[data.findIndex((element) => element === 'depth')+1];
               score = data[data.findIndex((element) => element === 'cp')+1];
               line = data.splice(data.findIndex((element) => element === 'pv')+1).join(' ');
               let lineNumber = data[data.findIndex((element) => element === 'multipv')+1] -1;
               let newEngineLines = [...engineLines];
               console.log(score);
               console.log(position.move);
               newEngineLines[lineNumber].score = score;
               newEngineLines[lineNumber].line = line;
               setEngineLines(newEngineLines);
            }
         }
         
      };
      stockfishRef.current.postMessage('uci');
      stockfishRef.current.postMessage('setoption name MultiPV value 3');
      stockfishRef.current.postMessage('ucinewgame');
      console.log('stockfish init ONLY ONCE');
   },[]);
 
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
         console.log('fen:' +getFENfromPosition(newPosition));
         stockfishRef.current.postMessage('stop');
         stockfishRef.current.postMessage('position fen '+getFENfromPosition(newPosition));
         stockfishRef.current.postMessage('go depth 16');
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
   console.log(position.move);
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
            eval = {position.move === colors.WHITE ? engineLines[0].score/100 : -(engineLines[0].score/100)} 
            line1 = {engineLines[0].line} 
            line2 = {engineLines[1].line} 
            line3 = {engineLines[2].line} 
            line1Eval = {position.move === colors.WHITE ? engineLines[0].score/100 : -(engineLines[0].score/100)}
            line2Eval = {position.move === colors.WHITE ? engineLines[1].score/100 : -(engineLines[1].score/100)}
            line3Eval = {position.move === colors.WHITE ? engineLines[2].score/100 : -(engineLines[2].score/100)} 
         />

         <GameMovesDisplay moves = {moveTree} onClickNode = {handleOnClickNode} selectedNode ={currentNodeID}/>

      </div>
         
   </div>
   );
}