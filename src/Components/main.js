import React from 'react'
import Style from './styles.css'
import { startPosition } from '../Services/chess';
import {Board} from './Board/Board'
import {GameMovesDisplay}from './GameMovesDisplay/GameMovesDisplay'
import {Node} from  '../Services/moveTree'

export class Main extends React.Component{
   constructor(props){
      super(props);
      let root = new Node('', 0);
      let e4 = new Node('e4',1);
      let e5 = new Node('e5',2);
      let nf3 = new Node('nf3',3);
      let nc3 = new Node('nc3',3);
      let nc6 = new Node('nc6',4);
      let nf6 = new Node('nf6',4);
      let nxe5 = new Node('nxe5',5);
      let nxe4 = new Node('nxe4',6);
      let e6 = new Node('e6', 6);
      let qe2 = new Node('qe2', 7);
      let d4 = new Node('e4', 7);
      let nf33 = new Node('nf3', 7);
      
      nc3.addChildren(nc6);
      nxe4.addChildren(qe2);
      nxe4.addChildren(d4);
      e6.addChildren(nf33);
      nxe5.addChildren(e6);
      nxe5.addChildren(nxe4);
      nf6.addChildren(nxe5);
      nf3.addChildren(nf6);
      e5.addChildren(nf3);
      e5.addChildren(nc3);
      e4.addChildren(e5);
      root.addChildren(e4);
      
     
      
      


      this.state = {
         position: startPosition,
         moves: root
      };
      
   }

   render(){
      return (
      <div className ='mainContainer'>
         <div className = 'anotationContainer'></div>
         <Board board={this.state.position.board} /> {/*convoluted naming*/}
         <div className = 'rightContainer'>
            <div className = 'engineContainer'></div>
            <GameMovesDisplay moves = {this.state.moves}/>
         </div>
         
      </div>
      );
   }

}