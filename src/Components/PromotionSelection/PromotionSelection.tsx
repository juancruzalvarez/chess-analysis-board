import { pieceImages } from '../../Assets/ImagesIndex';

export const PromotionSelection = (props) =>{
   
   return (
      <div className = 'promotionSelectionContainer'>
         <PromotionSelectionButton piece = 'N' onClickHandler = {props.onClickHandler}/>
         <PromotionSelectionButton piece = 'B'/>
         <PromotionSelectionButton piece = 'R'/>
         <PromotionSelectionButton piece = 'Q'/>
      </div>
   );
}
export const PromotionSelectionButton = (props)=>{
   let style = {
      backgroundImage: `url(${pieceImages[props.piece]})`,
      backgroundSize: '80%',
      backgroundPosition:'center',
      backgroundRepeat: 'no-repeat',
   }
   return <div className = 'promotionSelectionImage' style={style} onClick ={props.onClickHandler}></div>
}