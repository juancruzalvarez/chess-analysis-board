import React from 'react'
import {cloneDeep} from 'lodash';
import './styles.css'
import black_pawn_img_src from '../Assets/pieces/black_pawn.png'
import white_pawn_img_src from '../Assets/pieces/white_pawn.png'
import black_rook_img_src from '../Assets/pieces/black_rook.png'
import white_rook_img_src from '../Assets/pieces/white_rook.png'
import black_bishop_img_src from '../Assets/pieces/black_bishop.png'
import white_bishop_img_src from '../Assets/pieces/white_bishop.png'
import black_queen_img_src from '../Assets/pieces/black_queen.png'
import white_queen_img_src from '../Assets/pieces/white_queen.png'
import black_king_img_src from '../Assets/pieces/black_king.png'
import white_king_img_src from '../Assets/pieces/white_king.png'
import black_horse_img_src from '../Assets/pieces/black_horse.png'
import white_horse_img_src from '../Assets/pieces/white_horse.png'
import { startPosition, isMoveValid, doMove } from '../Services/chess.js'
const pieceImages = {
   'p':black_pawn_img_src,
   'P':white_pawn_img_src,
   'n':black_horse_img_src,
   'N':white_horse_img_src,
   'b':black_bishop_img_src,
   'B':white_bishop_img_src,
   'r':black_rook_img_src,
   'R':white_rook_img_src,
   'q':black_queen_img_src,
   'Q':white_queen_img_src,
   'k':black_king_img_src,
   'K':white_king_img_src
};

export class ChessBoard extends React.Component{
   constructor(props){
      super(props);
      this.state = {
         position: startPosition,
         selectedSquare: null
      };
      
   }

   render(){
      return (
         <div className='chessboard'>
            {
            this.state.position.board.map( (element, index)=>{
               let row = Math.floor(index/8);
               let col = index%8;
               return <Square key ={index}
                              isWhiteSquare  = {(row+col)&1}
                              piece          = {element}
                              onClick = {() => this.handleOnClick(index)}
                        />
            })
            }
         </div>
      )
   }

   handleOnClick(index){
      if(!this.state.selectedSquare){
         this.setState({selectedSquare:index});
      }else{
         if(isMoveValid(this.state.position,this.state.selectedSquare, index)){
            let pos = cloneDeep( this.state.position);
            doMove(pos, this.state.selectedSquare, index);
            this.setState({position:pos});
         }
         this.setState({selectedSquare:null});
      }
   }

}


const getPieceImage = (piece) => {
  return pieceImages[piece];
}
const Square = (props) =>{
   return (
      <div className={ 'square '.concat(props.isWhiteSquare ? 'white' : 'black')} onClick = {props.onClick}>
         {
            props.piece&& <img src= {getPieceImage(props.piece)} alt='chess piece'/>
         }
      </div>
   );
}
