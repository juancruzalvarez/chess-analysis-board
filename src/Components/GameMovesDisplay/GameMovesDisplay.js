import Style from '../styles.css'

export function GameMovesDisplay(props){
   return (
      <div className = 'gameMovesContainer'>
            {props.moves.map((element, index)=>{
               return <MoveDisplay move = {element} moveNumber = {index} />;
            })}
      </div>
   );
}

const MoveDisplay = (props) =>{
   return props.moveNumber%2 === 0 ? [<span className = 'moveDisplay'> {`${Math.floor(props.moveNumber/2)+1}`}</span>, <span className = 'moveDisplay'> {props.move}</span>] : <span className = 'moveDisplay'> {props.move}</span>;
}