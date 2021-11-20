import {useState} from 'react'
import { startPosition } from '../../Services/chess'
import styles from '../styles.css'
import { pieceImages } from '../../Assets/ImagesIndex';

export function Board(props){
   return (
      <div className='chessboard'>
         {
            props.board.map((element, index) =>{
               let row = Math.floor(index/8);
               let col = index%8;
               return <Square key     = {index}
                              shade   = {(row+col)&1 ? 'ligth' : 'dark'}
                              piece   = {element}
                              onClick = {() => this.handleOnClick(index)}
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
      backgroundRepeat: 'no-repeat'
   } 
   return (
   <div className= {'square ' + props.shade}>
      {
      props.piece && <div style={style}></div>
      }
   </div>
   );
}