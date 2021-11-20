import React from 'react'
import Style from './styles.css'
import { startPosition } from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'
import {Node} from  '../Services/moveTree'

export class Main extends React.Component{
   constructor(props){
      super(props);
      let e4 = new Node('e4',0);
      let e5 = new Node('e5',1);
      let nf3 = new Node('nf3',2);
      let nc3 = new Node('nc3',2);
      let nc6 = new Node('nc6',3);
      let nf6 = new Node('nf6',3);
      let nxe5 = new Node('nxe5',4);
      
      nc3.addChildren(nc6);
      nf6.addChildren(nxe5);
      nf3.addChildren(nf6);
      e5.addChildren(nc3);
      e5.addChildren(nf3);
      e4.addChildren(e5);
      
     
      
      


      this.state = {
         position: startPosition,
         moves: e4
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