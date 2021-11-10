const pieces = {
   NO_PIECE: '',
   PAWN:     'p',
   KNIGTH:   'n',
   BISHOP:   'b',
   ROOK:     'r',
   QUEEN:    'q',
   KING:     'k'
};

const colors ={
   NO_COLOR: '',
   WHITE:    'w',
   BLACK:    'b'
};

export const moveType ={
   ILEGAL_MOVE:'ILEGAL_MOVE',
   NORMAL_MOVE:'NORMAL_MOVE',
   CAPTURE_MOVE:'CAPTURE_MOVE',
   LONG_PAWN_MOVE:'LONG_PAWN_MOVE',    //move where pawn moves 2 squares forward
   CASTLE_MOVE:'CASTLE_MOVE',
}

export const startPosition = {
   board: 
      ['r','n','b','q','k','b','n','r',   //board array containing what pieces are in witch square
      'p','p','p','p','p','p','p','p',    // lowercase letters are black pieces and uppercase letters are white pieces
       '','','','','','','','',           // p->pawn, n->knight, b->bishop, r->rook, q->queen, k->king
       '','','','','','','','',           //ej p->black pawn, K->white king
       '','','','','','','','',
       '','','','','','','','',
      'P','P','P','P','P','P','P','P', 
      'R','N','B','Q','K','B','N','R'],
   move: colors.WHITE,                             //whose move it is in the position (w->white, b->black)
   castlingPrivileges:{                   //determinates how can white and black castle, based on if the king or rooks have moved.
      whiteShort: true,
      whiteLong:true,   
      blackShort:true,           
      blackLong:true
   },
   enpassantSquare: null,                  //holds the square witch can be captured enpassant, for most of the game null
   fiftyMoveRuleCount:0                    //holds the number of moves without captures or pawn pushes    
};

export const isMoveValid = (position, moveStart, moveEnd) =>{
   let start = {                                                       
      square: coord1Dto2D(moveStart),
      piece: position.board[moveStart],                                
      pieceColor: getPieceColor(position.board[moveStart])
   };

   let end = {                                                        
      square: coord1Dto2D(moveEnd),
      piece: position.board[moveEnd],                                
      pieceColor: getPieceColor(position.board[moveEnd])
   };

   let yMovement = Math.abs(end.square.y-start.square.y);
   let xMovement = Math.abs(end.square.x-start.square.x);

   if(start.pieceColor !== position.move){    //cannot move oponent's pieces.
      return false;
   }

   if(start.pieceColor === end.pieceColor){   //cannot capture your own pieces. fix so u can castle pressing on the rook

      return false;
   }

   switch(getPieceType(start.piece)){
      case pieces.PAWN:{
         if(start.pieceColor === colors.WHITE && end.square.y - start.square.y >0){       //pawns only move forwards
            return false;
         }
         if(start.pieceColor === colors.BLACK && end.square.y - start.square.y <0){       //pawns only move forwards
            return false;
         }
         if(xMovement === 1){
            //then if the move is valid it can only be a capture.
            if(yMovement!==1){
               return false;
            }else{
               if(end.piece ===''&& moveEnd !== position.enpassantSquare){
                  
                  return false;
               }
            }
         }else if(xMovement === 0){
            if(yMovement === 1){
               
               if(end.piece !==''){  //can only move to empty square.
                  return false;
               }
            }else if(yMovement === 2){
               //can only move two squares if its at starting position.
               
               if(start.pieceColor === 'w'){
                  if(start.square.y !== 6){
                     return false;
                  }
               }else{
                  if(start.square.y !== 1){
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

      case pieces.KNIGTH:{
         if(xMovement === 2){
            if(yMovement !== 1){
               return false;
            }
         }else if(xMovement === 1){
            if(yMovement !==2){
               return false;
            }
         }else{
            return false;
         }
         break;
      }

      case pieces.BISHOP:{
         if(xMovement!==yMovement || checkPath(position.board, start.square.x,start.square.y, end.square.x, end.square.y)!==pieces.NO_PIECE){
            return false;
         }
         break;
      }

      case pieces.ROOK:{
         
         if((xMovement!== 0 && yMovement !== 0) || checkPath(position.board, start.square.x,start.square.y, end.square.x, end.square.y)!==pieces.NO_PIECE){
            return false;
         }
         break;
      }

      case pieces.QUEEN:{
         if( ((xMovement!== 0 && yMovement !== 0)&&(xMovement!==yMovement)) ||
            checkPath(position.board, start.square.x,start.square.y, end.square.x, end.square.y)!==pieces.NO_PIECE ){
            return false;
         }
         break;
      }

      case pieces.KING:{
         if(yMovement>1){
            return false;
         }else if(xMovement>1){
            if(yMovement != 0){
               return false;
            }else{
               //castle
               if(start.x > end.x){
                  if(start.pieceColor === colors.WHITE && !position.castlingPrivileges.whiteLong){
                     return false;
                  }
                  if(start.pieceColor === colors.BLACK && !position.castlingPrivileges.blackLong){
                     return false;
                  }
               }else{
                  if(start.pieceColor === colors.WHITE && !position.castlingPrivileges.whiteShort){
                     return false;
                  }
                  if(start.pieceColor === colors.BLACK && !position.castlingPrivileges.blackShort){
                     return false;
                  }
               }
            }
         }

         break;
      }

      default: {
         
         return false;
      }
   }

   let newBoard = [...position.board];
   doMove(newBoard, moveStart, moveEnd);
   if(isOnCheck(newBoard, position.move)){
      return false;
   }
   
   return true;
};

export const doMove = (board, moveStart, moveEnd) =>{    //ionly changes board positions of pieces.
   let start = {                      
      square: coord1Dto2D(moveStart),
      piece: board[moveStart],  
      pieceColor: getPieceColor(board[moveStart])
   };

   let end = {  
      square: coord1Dto2D(moveEnd),
      piece: board[moveEnd],
      pieceColor: getPieceColor(board[moveEnd])
   };

   if(getPieceType(start.piece) === pieces.PAWN && start.square.x !== end.square.x && end.piece === pieces.NO_PIECE){         //hnalde enpassant
      board[moveEnd] = start.piece;
      board[moveStart] = '';
      if(start.pieceColor === colors.WHITE){
         board[coord2Dto1D(end.square.x,end.square.y+1)] = '';
      }else{
         board[coord2Dto1D(end.square.x,end.square.y-1)] = '';
      }
   }else if(getPieceType(start.piece)===pieces.KING && Math.abs(start.x-end.x) >1){                                                                              //handle castle and promotion
      
   }else{
      board[moveEnd] = board[moveStart];  
      board[moveStart] = '';
   }
   
};

export const performMove = (position, moveStart, moveEnd) =>{  //updates the entire position (really does the move)
   
   
  
   let start = {                                                        //starting square of the move
      square: coord1Dto2D(moveStart),
      piece: position.board[moveStart],                                 //piece to move
      pieceColor: getPieceColor(position.board[moveStart])
   };

   let end = {                                                        //starting square of the move
      square: coord1Dto2D(moveEnd),
      piece: position.board[moveEnd],                                 //piece to move
      pieceColor: getPieceColor(position.board[moveEnd])
   };
   let pieceType = getPieceType(start.piece);

   if(pieceType === pieces.PAWN && Math.abs(end.square.y-start.square.y) === 2){ // long pawn move, update enpassant square
      position.enpassantSquare = start.pieceColor === colors.WHITE ? coord2Dto1D(end.square.x, end.square.y+1) : coord2Dto1D(end.square.x, end.square.y-1);
   }else{
      position.enpassantSquare = null;
   }

   if(pieceType === pieces.PAWN ){      //update fifty move rule count
      position.fiftyMoveRuleCount = 0;
   }

   //handle castle
   position.move = getOpositeColor(position.move);
   doMove(position.board, moveStart, moveEnd);
}

const checkPath = (board, startX, startY, endX, endY)=>{    //returns the first piece on the path
   let stepX = Math.sign(endX-startX);
   let stepY = Math.sign(endY-startY);
   for(let i= 1; i<Math.max(Math.abs(endX-startX), Math.abs(endY-startY));i++){     
      let squareInPath = coord2Dto1D(startX+i*stepX, startY+i*stepY);
      let pieceAtSquare = board[squareInPath];
      if(pieceAtSquare !== pieces.NO_PIECE){
         return pieceAtSquare;
      }
   }
   return pieces.NO_PIECE;
};

const isAttackedBy = (board, square, color)=>{ //return true if color is attacking square.
   let squarePos = coord1Dto2D(square)
   let x = squarePos.x;
   let y = squarePos.y;
   let queen = getPieceOfColor(pieces.QUEEN,color);
   let rook = getPieceOfColor(pieces.ROOK, color);
   let knight = getPieceOfColor(pieces.KNIGTH, color);
   let bishop = getPieceOfColor(pieces.BISHOP, color);
   let pawn = getPieceOfColor(pieces.PAWN, color);
   let king = getPieceOfColor(pieces.KING, color);

   //horizontal direction
   let pieceHit;
   pieceHit = checkPath(board, x,y,8,y);
   if(pieceHit === queen || pieceHit === rook || pieceHit === king){
      return true;
   }
   pieceHit = checkPath(board, x,y,0,y);//should be -1????????
   if(pieceHit === queen || pieceHit === rook || pieceHit === king){
      return true;
   }

   //vertical direction
   pieceHit = checkPath(board, x,y,x,8);
   if(pieceHit === queen || pieceHit === rook || pieceHit === king){
      return true;
   }
   pieceHit = checkPath(board, x,y,x,0);//should be -1????????
   if(pieceHit === queen || pieceHit === rook || pieceHit === king){
      return true;
   }

   //diagonals
   pieceHit = checkPath(board, x,y,x+8,y+8);
   if(pieceHit === queen || pieceHit === bishop){
      return true;
   }
   pieceHit = checkPath(board, x,y,x-8,y+8);
   if(pieceHit === queen || pieceHit === bishop){
      return true;
   }
   pieceHit = checkPath(board, x,y,x+8,y-8 );
   if(pieceHit === queen || pieceHit === bishop){
      return true;
   }
   pieceHit = checkPath(board, x,y,x-8,y-8 );
   if(pieceHit === queen || pieceHit === bishop){
      return true;
   }

   //pawn attacks
   let pawnAttackSquares = color === colors.WHITE ? [coord2Dto1D(x-1,y+1), coord2Dto1D(x+1,y+1)] : [coord2Dto1D(x-1,y-1), coord2Dto1D(x+1,y-1)];
   for(const s of pawnAttackSquares){
      if(s!==null && board[s] === pawn){
         return true;
      }
   }

   //knight attacks
   let knightAttackSquares = [coord2Dto1D(x+2,y+1), coord2Dto1D(x+2,y-1),coord2Dto1D(x-2,y+1),coord2Dto1D(x-2,y-1),
    coord2Dto1D(x+1,y+2),coord2Dto1D(x-1,y+2),coord2Dto1D(x+1,y-2),coord2Dto1D(x-1,y-2)];
   for(const s of knightAttackSquares){
      if(s!==null && board[s] === knight){
         return true;
      }
   }
   return false;
};

const isOnCheck = (board, color)=>{    
   let king = getPieceOfColor(pieces.KING, color);
   let kingSquare = board.findIndex((element)=>element === king);
   return isAttackedBy(board, kingSquare, getOpositeColor(color));
};

const coord2Dto1D = (x, y)=>{
   if(x>=0 && x<8 &&y>=0 && y<8){
      return y*8+x;
   }
   return null;
};

const coord1Dto2D = (index)=>{
   if(index >= 0 && index < 64){
      let pos = {
         x: index%8,
         y: Math.floor(index/8)
      };
      return pos;
   }
   return null;
};

const getPieceType = (piece)=>{
   return piece.toLowerCase();
}

const getPieceColor = (piece)=>{
   if(piece){
      return piece === piece.toLowerCase() ? colors.BLACK: colors.WHITE;
   }else{
      return colors.NO_COLOR;
   }
};

const getPieceOfColor = (piece, color) =>{   //return a piece of the color given ('r','w') -> 'R'
   return color === colors.WHITE ? piece.toUpperCase() : piece.toLowerCase();
};

const getOpositeColor = (color) =>{
   if(color){
      return (color === colors.WHITE ? colors.BLACK : colors.WHITE);
   }
   return colors.NO_COLOR;
};

