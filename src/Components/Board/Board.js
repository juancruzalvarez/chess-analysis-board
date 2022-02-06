import { useState } from 'react';
import { pieceImages } from '../../Assets/ImagesIndex';
import { moveType } from '../../Services/chess';

export function Board(props){
   const [mousePosition, setMousePosition] = useState({x:0,y:0});
   const handleOnMouseMove = (e)=>{
      setMousePosition({x:e.clientX, y:e.clientY});
   };
   return (
      <div ref = {props.boardReference} className='chessboard' onMouseDown = {props.onMouseDown} onMouseUp = {props.onMouseUp} onMouseMove = {handleOnMouseMove}>
         {
            props.board.map((element, index) =>{
               let row = Math.floor(index/8);
               let col = index%8;
               return <Square id =      {index}
                              key     = {index}
                              shade   = {(row+col)&1 ? 'ligth' : 'dark'}
                              piece   = {element}
                              pieceSize = {props.pieceSize}
                              grabbed = {props.grabbedPiece === index}
                              mousePosition = {mousePosition}
                        />
            })
         }
      </div>

   );
}


const Square = (props) =>{
   let style={
      width: '100%',
      height: '100%',
      backgroundImage: `url(${pieceImages[props.piece]})`,
      backgroundSize: '80%',
      backgroundPosition:'center',
      backgroundRepeat: 'no-repeat',
      position:'',
      top:'',
      left:''
   } 

   if(props.grabbed){
      style.width = props.pieceSize+'px';
      style.height = props.pieceSize+'px';
      style.position = 'absolute';
      style.top = props.mousePosition.y-props.pieceSize/2;
      style.left = props.mousePosition.x-props.pieceSize/2;

   }
   return (
   <div   className= {'square ' + props.shade}>
      {
      props.piece && <div id = {props.id} style={style}></div>
      }
   </div>
   );
}