import {useState, useRef, useEffect} from 'react'
//eslint-disable-next-line
import Style from './styles.css'
import { startPosition, isMoveValid, performMove, getPositionFromFEN, squareNotationToIndex, indexToSquareNotation, getFENfromPosition, moveType, colors, longToShortAlgebraicNotation} from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'
import {Node, searchNode, insertNode} from  '../Services/moveTree'
import { EngineEvaluation } from './EngineEvaluation/EngineEvaluation';
import {cloneDeep} from 'lodash';

export const Analysis = (props) =>{
   
   const [searchDepth, setSearchDepth] = useState(0);
   const [position, setPosition] = useState(startPosition);
   const [moveTree, setMoveTree] = useState(new Node(0, '', startPosition));
   const [selectedSquare, setSelectedSquare] = useState(null);
   const [mousePosition, setMousePosition] = useState({x:0,y:0});
   const [currentNodeID, setCurrentNodeID] = useState(0);
   const [newNodeID, setNewNodeID] = useState(1);
   const [engineOn, setEngineOn] = useState(false);
   const [engineLines, setEngineLines] = useState([{score:'',line:''}, {score:'',line:''}, {score:'',line:''}]);
   const boardRef = useRef();
   const stockfishRef = useRef(null);
 
   const getBoardSquare = (clientX, clientY) =>{
      const boardElement = boardRef.current;
      const boundingRect = boardElement.getBoundingClientRect();
      let x = Math.floor(8 * ( (clientX-boundingRect.left)/boundingRect.width ) );
      let y = Math.floor(8 * ( (clientY-boundingRect.top)/boundingRect.height ) );
      return y*8 + x;
   }

   const restartEvaluation = (position) =>{
      if(stockfishRef.current){
         stockfishRef.current.terminate();
         stockfishRef.current = null;
      }
      setSearchDepth(0);
      setEngineLines([{score:'...',line:''},{score:'...',line:''},{score:'...',line:''}]);
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
            score = data[data.findIndex((element) => element === 'cp')+1]/100;
            let tmp = cloneDeep(position);
            line = data.splice(data.findIndex((element) => element === 'pv')+1).map(
               (element) =>{
                  let m = longToShortAlgebraicNotation(tmp, element);
                  performMove(tmp,squareNotationToIndex(element.substring(0,2)),squareNotationToIndex(element.substring(2,4)));
                  return m;
               }).join(' ');
            let lineNumber = data[data.findIndex((element) => element === 'multipv')+1] -1;
            let newEngineLines = [...engineLines];
            newEngineLines[lineNumber].score = position.move === 'w'? score: -score;
            newEngineLines[lineNumber].line = line;
            setEngineLines(newEngineLines);
            setSearchDepth(depth);
            }
         }
      
      };
      stockfishRef.current.postMessage('uci');
      stockfishRef.current.postMessage('setoption name MultiPV value 3');
      stockfishRef.current.postMessage('ucinewgame');
      stockfishRef.current.postMessage('position fen '+getFENfromPosition(position));
      stockfishRef.current.postMessage('go depth 22');
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
         restartEvaluation(newPosition);
      }
      setSelectedSquare(null);
   }

   const handleOnMouseMove = (e)=>{
      setMousePosition({x:e.clientX, y:e.clientY});
   }

   const handleOnClickNode = (clickedNodeId, clickedNodePosition) =>{
      setCurrentNodeID(clickedNodeId);
      setPosition(clickedNodePosition);
      restartEvaluation(clickedNodePosition);
   }

   const handleEnginetoggle = ()=>{
      if(engineOn){ //if it was on kill thread and reset.
         if(stockfishRef.current){
            stockfishRef.current.terminate();
            stockfishRef.current = null;
         }
         setSearchDepth(0);
         setEngineLines([{score:'...',line:''},{score:'...',line:''},{score:'...',line:''}]);
      }else{
         //it was off, restart evaluation.
         restartEvaluation(position);
      }
      setEngineOn(!engineOn);
      console.log('ENGINE WAS TOOGLED.');
      console.log('LAST STATE:'+engineOn);
      console.log('NEW STATE:'+!engineOn);
      console.log('stockfishTreadh:'+stockfishRef.current);
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
            eval = {engineLines[0].score} 
            line1 = {engineLines[0].line} 
            line2 = {engineLines[1].line} 
            line3 = {engineLines[2].line} 
            line1Eval = {engineLines[0].score}
            line2Eval = {engineLines[1].score}
            line3Eval = {engineLines[2].score} 
            searchDepth = {searchDepth}
            handleEngineToggle = {handleEnginetoggle}
         />

         <GameMovesDisplay moves = {moveTree} onClickNode = {handleOnClickNode} selectedNode ={currentNodeID}/>

      </div>
         
   </div>
   );
}