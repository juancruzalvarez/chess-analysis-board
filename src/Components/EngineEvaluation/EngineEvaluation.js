import { useState } from "react";
export const EngineEvaluation = (props)=>{
   const [showEval, setShowEval] = useState(false);

   const onButtonClicked = ()=>{
      setShowEval(!showEval);
      props.handleEngineToggle();
   }
   return (
      <div className = 'engineContainer'>
         <div className ='engineHeaderContainer'>
            <span className = 'eval'>{showEval ? props.eval : ''}</span>
            <div>
            <div className = 'engineName'>Stockfish 13</div>
            {showEval &&<div className = 'depth'>{'Depth:' + props.searchDepth +'/22'}</div>}
            </div>
            <label className="switch" >
               <input type="checkbox" onClick = {onButtonClicked}/>
               <span className="slider round"></span>
            </label>
         </div>
         
        
         {showEval && <EngineLine line = {props.line1} eval = {props.line1Eval}/>}
         {showEval && <EngineLine line = {props.line2} eval = {props.line2Eval} />}
         {showEval && <EngineLine line = {props.line3} eval = {props.line3Eval} />}
      </div>

   );
}

const EngineLine = (props) =>{
   return <div className = 'engineLine'><strong>{props.eval}</strong>   {props.line}</div> 
}