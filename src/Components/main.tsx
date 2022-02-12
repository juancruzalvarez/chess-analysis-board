
import {useState, useRef, useEffect} from 'react';
//eslint-disable-next-line
import {PieceTypes, Colors, getPieceType, startPosition, isMoveValid, makeMove, getMoveNotation, squareNotationToIndex,getFENfromPosition, longToShortAlgebraicNotation} from '../Services/chess';
import {Board} from './Board/Board';
import { PromotionSelection } from './PromotionSelection/PromotionSelection';
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay';
import {Node, insertNode, searchNode, getParent} from  '../Services/moveTree';
import { EngineEvaluation } from './EngineEvaluation/EngineEvaluation';
import {cloneDeep} from 'lodash';

const Style = require('./styles.css');

export const Analysis = (props) =>{
   
   const [searchDepth, setSearchDepth] = useState(0);
   const [position, setPosition] = useState(startPosition);
   const [moveTree, setMoveTree] = useState(new Node(0, '', startPosition));
   const [selectedSquare, setSelectedSquare] = useState(null);
   const [currentNodeID, setCurrentNodeID] = useState(0);
   const [newNodeID, setNewNodeID] = useState(1);
   const [engineOn, setEngineOn] = useState(false);
   const [engineLines, setEngineLines] = useState([{score:'',line:''}, {score:'',line:''}, {score:'',line:''}]);
   const [promMove, setPromMove] = useState(null);
   const [showPromMenu, setShowPromMenu] = useState(false);
   const boardRef = useRef<HTMLElement>();
   const stockfishRef = useRef(null);

   const keyDownHandler = (event) => {
      let updatedCurrentNodeID, updatedMoveTree, updatedEngineOn;
      setCurrentNodeID((current) =>{updatedCurrentNodeID = current; return current;});
      setMoveTree((current) =>{updatedMoveTree = current; return current;});
      setEngineOn((current) =>{updatedEngineOn = current; return current;})
      if(event.key === 'ArrowLeft'){
         let parentNode = getParent(updatedMoveTree, updatedCurrentNodeID);
         setCurrentNodeID(parentNode.id);
         setPosition(parentNode.position);
         if(updatedEngineOn){
            restartEvaluation(parentNode.position);
         }
      }else if (event.key === 'ArrowRight'){
         let currentNode = searchNode(updatedCurrentNodeID, updatedMoveTree);
         if(currentNode){
            let nextNode = currentNode.getChildren()[0];
            if(nextNode){
               setCurrentNodeID(nextNode.id);
               setPosition(nextNode.position);
               if(updatedEngineOn){
                  restartEvaluation(nextNode.position);
               }
            }
         }

      }
    };

    useEffect(() => {
      window.addEventListener('keydown', keyDownHandler);
      return ()=>{window.removeEventListener('keydown', keyDownHandler)}
    }, []);
 
   const getBoardSquare = (clientX, clientY) =>{
      const boardElement = boardRef.current;
      const boundingRect = boardElement.getBoundingClientRect();
      let x = Math.floor(8 * ( (clientX-boundingRect.left)/boundingRect.width ) );
      let y = Math.floor(8 * ( (clientY-boundingRect.top)/boundingRect.height ) );
      return y*8 + x;
   };

   const restartEvaluation = (position) =>{
      
      if(stockfishRef.current){
         stockfishRef.current.terminate();
         stockfishRef.current = null;
      }
      setSearchDepth(0);
      setEngineLines([{score:'...',line:''},{score:'...',line:''},{score:'...',line:''}]);
      stockfishRef.current = new Worker("stockfish.js");
      stockfishRef.current.onmessage = function(event) {
         let data = [];
         let depth;
         let score;
         let mate;
         let line;
         if(event.data){
            data = event.data.split(' ');
            if(data[0] === 'info'){
               depth = data[data.findIndex((element) => element === 'depth')+1];
               score = data[data.findIndex((element) => element === 'cp')+1]/100;
               let i = data.findIndex((element) => element === 'mate');
               mate = i !== -1 ? data[i+1] : null;
               let tmp = cloneDeep(position);
               line = data.splice(data.findIndex((element) => element === 'pv')+1).map(
                  (element) =>{
                     let m = longToShortAlgebraicNotation(tmp, element);
                     tmp = makeMove(tmp,{from:squareNotationToIndex(element.substring(0,2)),to:squareNotationToIndex(element.substring(2,4)), prom:null});
                     return m;
                  }).join(' ');
               let lineNumber = data[data.findIndex((element) => element === 'multipv')+1] -1;
               let newEngineLines = [...engineLines];
               newEngineLines[lineNumber].score = mate ? '#'+mate : (position.move === 'w'? score: -score);
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
      
   };
   
   const handleOnMouseDown = (e) =>{
      let index = getBoardSquare(e.clientX, e.clientY);
      if(position.board[index]){
         setSelectedSquare(index);
      }
   };

   const handleOnMouseUp = (e) =>{
      let index = getBoardSquare(e.clientX, e.clientY);
      let move = {from:selectedSquare, to:index, prom:null};
      let rank = Math.floor(index/8);
      if(getPieceType(position.board[selectedSquare]) === PieceTypes.PAWN &&(rank===0 ||rank===7)){
         //promotion
         //crate promotion selection contex menu and make it add the move itself
         setShowPromMenu(true);
         setPromMove(move);
      }else{
         addMove(move);
      }
      
      setSelectedSquare(null);
   };

   const addMove = (move) =>{
      if(isMoveValid(position, move)){
         let newPosition = makeMove(position, move);
         let newNode = new Node(newNodeID, getMoveNotation(position, move), newPosition);
         let newMoveTree = cloneDeep(moveTree);
         insertNode(newMoveTree, currentNodeID, newNode);
         setPosition(newPosition);
         setMoveTree(newMoveTree);
         setCurrentNodeID(newNodeID);
         setNewNodeID(newNodeID + 1);
         if(engineOn){
            restartEvaluation(newPosition);
         }
      }
   };

   const handleOnClickNode = (clickedNodeId, clickedNodePosition) =>{
      setCurrentNodeID(clickedNodeId);
      setPosition(clickedNodePosition);
      if(engineOn){
         restartEvaluation(clickedNodePosition);
      }
   };

   const handleOnClickPromotion = (piece) =>{
      addMove({...promMove, prom:piece});
      setShowPromMenu(false);
      setPromMove(null);
   };

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
   };

   return (
   <div className ='mainContainer'>
      {showPromMenu && <PromotionSelection onClickHandler = {handleOnClickPromotion} color = {Math.floor(promMove.to/8) ===7 ? Colors.BLACK : Colors.WHITE}/>}
      <div className = 'anotationContainer'></div>

      <Board 
         boardReference = {boardRef}
         board = {position.board}
         pieceSize = { boardRef.current && boardRef.current.getBoundingClientRect().width/8}
         grabbedPiece = {selectedSquare}
         onMouseDown =  {handleOnMouseDown}
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