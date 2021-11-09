export const startPosition = {
   board: 
      ['r','n','b','q','k','b','n','r',   //board array containing what pieces are in witch square
      'p','p','p','p','p','p','p','p',    // lowercase letters are black pieces and uppercase letters are white pieces
       '','','','','','','','',           // p->pawn, n->knight, b->bishop, r->rook, q->queen, k->king
       '','','','','','','','',           //ej p->black_pawn, K->white_king
       '','','','','','','','',
       '','','','','','','','',
      'P','P','P','P','P','P','P','P', 
      'R','N','B','Q','K','B','N','R'],
   move: 'w',                             //whose move it is in the position (w->white, b->black)
   castlingPrivileges:{                   //determinates how can white and black castle, based on if the king or rooks have moved.
      whiteShort:true,            
      whiteLong:true,    
      blackShort:true,           
      blackLong:true
   },
   enpassantSquare: null                  //holds the square witch can be captured enpassant, for most of the game null                         
};


export const isMoveValid = (position, moveStart, moveEnd) =>{
   let start = {                                                        //starting square of the move
      x: moveStart%8,     
      y: Math.floor(moveStart/8),
      piece: position.board[moveStart],                                 //piece to move
   };
   start.pieceColor = start.piece == start.piece.toLowerCase() ? 'b': 'w';
   start.pieceColor = start.piece ? start.pieceColor : '';
   let end = {                                                          //end square of the move
      x: moveEnd%8,
      y: Math.floor(moveEnd/8),
      piece: position.board[moveEnd],                                  //piece at the square we want to move to
   };
   end.pieceColor = end.piece == end.piece.toLowerCase() ? 'b': 'w';
   end.pieceColor = end.piece ? end.pieceColor : '';

   let yMovement = Math.abs(end.y-start.y);
   let xMovement = Math.abs(end.x-start.x);

   if(start.pieceColor != position.move){    //cannot move oponent's pieces.
      return false;
   }
   if(start.pieceColor == end.pieceColor){   //cannot capture your own pieces.   FIX_FOR_CASTLE
      alert('help');
      return false;
   }

   switch(start.piece.toLowerCase()){

      case '':{
         return false;     
      }

      case 'p':{
         
         if(xMovement == 1){
            //then if the move is valid it can only be a capture.
            if(yMovement!=1){
               return false;
            }else{
               if(end.piece ==''&& moveEnd != position.enpassantSquare){
                  
                  return false;
               }
            }
         }else if(xMovement == 0){
            if(yMovement == 1){
               
               if(end.piece !=''){  //can only move to empty square.
                  return false;
               }
            }else if(yMovement == 2){
               //can only move two squares if its at starting position.
               
               if(start.pieceColor == 'w'){
                  if(start.y != 6){
                     return false;
                  }
               }else{
                  if(start.y != 1){
                     return false;
                  }
               }
            }else{
               return false;
            }
         }else{
            //pawns cannot move more than one square horizontally.
            return false;
         }
         break;
      }

      case 'n':{
         if(xMovement == 2){
            if(yMovement != 1){
               return false;
            }
         }else if(xMovement == 1){
            if(yMovement !=2){
               return false;
            }
         }else{
            return false;
         }
         break;
      }

      case 'b':{
         if(xMovement!=yMovement){
            return false;
         }else{
            let stepX = Math.sign(end.x-start.x);
            let stepY = Math.sign(end.y-start.y);
            for(let i= 0; i<xMovement-1;i++){ // we do xMovement-1 becouse the target square is already checked at the top, it could also be yMovement-1
               let squareInPath = start.y+i*stepY*8 + (start.x+i*stepX);
            }
         }
      }

   }
   return true;
}

export const doMove = (position, moveStart, moveEnd) =>{
   position.board[moveEnd] = position.board[moveStart];
   position.board[moveStart] = '';
   position.move = position.move == 'w' ? 'b' : 'w';     //change whose turn is it
}