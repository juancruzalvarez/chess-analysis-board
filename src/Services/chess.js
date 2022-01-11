import { parseInt } from "lodash";

const squares = {
   a8: 0,
   b8: 1,
   c8: 2,
   d8: 3,
   f8: 5,
   g8: 6,
   h8: 7,
   a1: 56,
   b1: 57,
   c1: 58,
   d1: 59,
   f1: 61,
   g1: 62, 
   h1: 63 
}

export const pieces = {
   NO_PIECE: '',
   PAWN:     'p',
   KNIGTH:   'n',
   BISHOP:   'b',
   ROOK:     'r',
   QUEEN:    'q',
   KING:     'k'
};

export const colors ={
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
      ['r','n','b','q','k','b','n','r',   //array holding pieces positions
      'p','p','p','p','p','p','p','p',    // lowercase -> black  UPPERCASE -> white
       '','','','','','','','',           // p->pawn, n->knight, b->bishop, r->rook, q->queen, k->king
       '','','','','','','','',           //ej p->black pawn, K->white king
       '','','','','','','','',
       '','','','','','','','',
      'P','P','P','P','P','P','P','P', 
      'R','N','B','Q','K','B','N','R'],
   move: colors.WHITE,                             //whose move it is in the position
   castlingPrivileges:'kqKQ',                  //determinates how can white and black castle, based on if the king or rooks have moved.
   enpassantSquare: null,                  //holds the square witch can be captured enpassant, for most of the game null.
   fiftyMoveRuleCount:0,                    //holds the number of moves without captures or pawn pushes.
   halfMoves:0                               //number of halfmoves since the start of the game.
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
            if(yMovement !== 0){
               return false;
            }else{
               //castle
               if(start.square.x > end.square.x){
                  if(start.pieceColor === colors.WHITE && 
                     (!position.castlingPrivileges.includes('Q')||
                     position.board[squares.d1] !== pieces.NO_PIECE ||
                     position.board[squares.c1] !== pieces.NO_PIECE ||
                     position.board[squares.b1] !== pieces.NO_PIECE ||
                     isAttackedBy(position.board,squares.d1,getOpositeColor(start.pieceColor)))){
                     return false;
                  }
                  if(start.pieceColor === colors.BLACK &&
                     (!position.castlingPrivileges.includes('q') ||
                     position.board[squares.d8]!== pieces.NO_PIECE ||
                     position.board[squares.c8]!== pieces.NO_PIECE ||
                     position.board[squares.b8] !== pieces.NO_PIECE ||
                     isAttackedBy(position.board,squares.d8,getOpositeColor(start.pieceColor)))){
                     return false;
                  }
               }else{
                  if(start.pieceColor === colors.WHITE &&
                     (!position.castlingPrivileges.includes('k') ||
                     position.board[squares.f1]!== pieces.NO_PIECE ||
                     position.board[squares.g1]!== pieces.NO_PIECE ||
                         isAttackedBy(position.board,squares.f1,getOpositeColor(start.pieceColor)))){
                     return false;
                  }
                  if(start.pieceColor === colors.BLACK &&
                     (!position.castlingPrivileges.includes('K') ||
                     position.board[squares.f8]!== pieces.NO_PIECE ||
                     position.board[squares.g8]!== pieces.NO_PIECE ||
                     isAttackedBy(position.board,squares.f8,getOpositeColor(start.pieceColor)))){
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
      board[moveStart] = pieces.NO_PIECE;
      if(start.pieceColor === colors.WHITE){
         board[coord2Dto1D(end.square.x,end.square.y+1)] = pieces.NO_PIECE;
      }else{
         board[coord2Dto1D(end.square.x,end.square.y-1)] = pieces.NO_PIECE;
      }
   }else if(getPieceType(start.piece)===pieces.KING && Math.abs(start.square.x-end.square.x) >1){                                                                              //handle castle and promotion
      let rank = start.pieceColor === colors.WHITE ? 7 : 0;
      console.log(rank);
      if(start.square.x-end.square.x >0){
         board[moveStart] = pieces.NO_PIECE;
         board[coord2Dto1D(0,rank)] = pieces.NO_PIECE;
         board[coord2Dto1D(2,rank)] = getPieceOfColor(pieces.KING, start.pieceColor);
         board[coord2Dto1D(3,rank)] = getPieceOfColor(pieces.ROOK, start.pieceColor);
      }else{
         board[moveStart] = pieces.NO_PIECE;
         board[coord2Dto1D(7,rank)] = pieces.NO_PIECE;
         console.log(coord2Dto1D(7,rank));
         board[coord2Dto1D(6,rank)] = getPieceOfColor(pieces.KING, start.pieceColor);
         console.log(coord2Dto1D(6,rank));
         board[coord2Dto1D(5,rank)] = getPieceOfColor(pieces.ROOK, start.pieceColor);
         console.log(coord2Dto1D(5,rank));
      } 
   }else{
      board[moveEnd] = board[moveStart];  
      board[moveStart] = pieces.NO_PIECE;
   }
   
};

export const performMove = (position, moveStart, moveEnd) =>{  //updates the entire position (really does the move) and return the move in algebraic notation

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

   position.fiftyMoveRuleCount++;
   if(pieceType === pieces.PAWN ){      
      position.fiftyMoveRuleCount = 0; //update fifty move rule count
      if(Math.abs(end.square.y-start.square.y) === 2){
         position.enpassantSquare = start.pieceColor === colors.WHITE ? coord2Dto1D(end.square.x, end.square.y+1) : coord2Dto1D(end.square.x, end.square.y-1);
      }else{
         position.enpassantSquare = null;
      }
   }else if(pieceType === pieces.KING){
      if(start.pieceColor === colors.WHITE){
         position.castlingPrivileges.replace('K','');
         position.castlingPrivileges.replace('Q','');
      }else{
         position.castlingPrivileges.replace('k','');
         position.castlingPrivileges.replace('Q','');
      }
   }else if(pieceType === pieces.ROOK){
      if(start.pieceColor === colors.WHITE){
         if(moveStart === squares.a1){
            position.castlingPrivileges.replace('Q','');
         }else if(moveStart === squares.h1){
            position.castlingPrivileges.replace('K','');
         }
      }else{
         if(moveStart === squares.a8){
            position.castlingPrivileges.replace('q','');
         }else if(moveStart === squares.h8){
            position.castlingPrivileges.replace('k','');
         }
      }
   }
   position.move = getOpositeColor(position.move);
   position.halfMoves++;
   doMove(position.board, moveStart, moveEnd);
   return pieceType.toUpperCase() +(end.piece !==pieces.NO_PIECE ? 'x' :'')+indexToSquareNotation(moveEnd)+ (isOnCheck(position.board, position.move) ? '+':'');
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

export const getPositionFromFEN = (fen) =>{
   let position = {};
   position.board = [];
   let split = fen.split(' ');
   let board = split[0].replaceAll('/', '');
   let index = 0;
   for(let i = 0; i<board.length; i++){
      let number = parseInt(board[i]);
      if(isNaN(number)){
         position.board[index] = board[i];
         index++;
      }else{
         for(let j = index; j< index+number; j++){
            position.board[j] = null;
         }
         index+=number;
      }
   }
   position.move = split[1];
   position.castlingPrivileges = split[2];
   position.enpassantSquare = split[3] === '-' ? null : squareNotationToIndex(split[3]);
   position.fiftyMoveRuleCount = parseInt(split[4]);
   console.log(position.board);
}

export const getFENfromPosition = (position) =>{
   let FEN = '';
   let rowCount = 0;
   let emptyCount = 0;
   for(let i = 0; i<64;i++){
      if(position.board[i]){
         if(emptyCount){
            FEN +=emptyCount;
            emptyCount = 0;
         }
         FEN += position.board[i];
      }else{
         emptyCount++;
      }
      rowCount++;
      if(rowCount === 8){
         if(emptyCount){
            FEN += emptyCount;
            emptyCount = 0;
         }
         FEN += '/';
         rowCount = 0;
      }
   }

   FEN += ' ';
   FEN += position.move;
   FEN += ' ';
   FEN += position.castlingPrivileges;
   FEN += ' ';
   FEN += position.enpassantSquare ? indexToSquareNotation(position.enpassantSquare) : '-';
   FEN += ' ';
   FEN += position.fiftyMoveRuleCount;
   FEN += ' ';
   FEN += '0';
   return FEN;
}

export const squareNotationToIndex = (square) => {
   //console.log(square[0], square.charCodeAt(0));
   return ( 8-parseInt(square[1]) )*8 + square.charCodeAt(0) - 97;
}

export const indexToSquareNotation = (index) =>{
   let x = index % 8;
   let y = Math.floor(index/8);
   return String.fromCharCode(x+97).concat(8-y);
}