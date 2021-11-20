import React from 'react'
import Style from './styles.css'
import { startPosition } from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'

export class Main extends React.Component{
   constructor(props){
      super(props);
      this.state = {
         position: startPosition,
         moves: ['e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6','e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6','e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6', 'e4', 'e5', 'Nf6','Nc6']
      };
      
   }

   render(){
      return (
      <div className ='mainContainer'>
         <div className = 'anotationContainer'></div>
         <Board board={this.state.position.board} /> {/*convoluted naming*/}
         <div className = 'engineContainer'></div>
         <GameMovesDisplay moves = {this.state.moves}/>
         <div className = 'toolbarContainer'></div>
      </div>
      );
   }

}