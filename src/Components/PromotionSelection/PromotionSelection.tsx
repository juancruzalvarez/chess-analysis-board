import { pieceImages } from '../../Assets/ImagesIndex';
import { PieceTypes, getPieceOfColor } from '../../Services/chess';
export const PromotionSelection = (props) =>{
   
   return (
      <div className = 'promotionSelectionContainer'>
         <PromotionSelectionButton piece = {PieceTypes.KNIGTH} onClickHandler = {props.onClickHandler} color={props.color}/>
         <PromotionSelectionButton piece = {PieceTypes.BISHOP} onClickHandler = {props.onClickHandler} color={props.color}/>
         <PromotionSelectionButton piece = {PieceTypes.ROOK} onClickHandler = {props.onClickHandler} color={props.color}/>
         <PromotionSelectionButton piece = {PieceTypes.QUEEN} onClickHandler = {props.onClickHandler} color={props.color}/>
      </div>
   );
}
export const PromotionSelectionButton = (props)=>{
   let style = {
      backgroundImage: `url(${pieceImages[getPieceOfColor(props.piece, props.color)]})`,
      backgroundSize: '80%',
      backgroundPosition:'center',
      backgroundRepeat: 'no-repeat',
   }
   return <div className = 'promotionSelectionImage' style={style} onClick ={()=>props.onClickHandler(props.piece)}></div>
}