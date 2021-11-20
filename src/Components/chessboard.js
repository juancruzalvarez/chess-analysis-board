import React from 'react'
import {cloneDeep} from 'lodash';
import './styles.css'


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
                              isWhiteSquare  = {(row+col)&1 ? 'light' : 'dark' }
                              piece          = {element}
                              onClick = {() => this.handleOnClick(index)}
                        />
            })
            }
         </div>
      )
   }

   handleOnClick(index){
      if(this.state.selectedSquare == null){
         this.setState({selectedSquare:index});
      }else{
         if(isMoveValid(this.state.position,this.state.selectedSquare, index)){
            let pos = cloneDeep( this.state.position);
            performMove(pos, this.state.selectedSquare, index);
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
