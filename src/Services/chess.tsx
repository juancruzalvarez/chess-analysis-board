import cloneDeep from 'lodash/cloneDeep'
import parseInt from 'lodash/parseInt'

enum Squares{
   a8= 0,
      b8,c8,d8,f8,g8,h8,
   a7,b7,c7,d7,f7,g7,h7,
   a6,b6,c6,d6,f6,g6,h6,
   a5,b5,c5,d5,f5,g5,h5,
   a4,b4,c4,d4,f4,g4,h4,
   a3,b3,c3,d3,f3,g3,h3,
   a2,b2,c2,d2,f2,g2,h2,
   a1,b1,c1,d1,f1,g1,h1,
   NO_SQUARE
}

enum PieceTypes{
   NO_PIECE = '',
   PAWN     = 'p',
   KNIGTH   = 'n',
   BISHOP   = 'b',
   ROOK     = 'r',
   QUEEN    = 'q',
   KING     = 'k'
};

enum Colors{
   NO_COLOR = '',
   WHITE    = 'w',
   BLACK    = 'b'
};

type Position = {
   board:string[],            //array holding pieces positions
   move:Colors,                //whose move it is in the position
   castlingPrivileges:string, //determinates how can white and black castle, representing white with uppercase and black with lowecase.
                              // ej: 'kqK' white can castle kingside and black to both sides
                              // ej: 'Qk white can castle queenside and black kingside
   enpassantSquare:number,    //holds the square witch can be captured enpassant, for most of the game null.
   fiftyMoveRuleCount:number, //holds the number of moves without captures or pawn pushes.
   halfMoves:number           //number of halfmoves since the start of the game.
};

type Square = {
   x:number,
   y:number
}

const onBounds = ({x,y} : Square) : boolean => x>=0&&x<8&&y>=0&&y<8;

const coord2Dto1D = ({x,y} : Square) : number|null =>{
   if(x>=0 && x<8 &&y>=0 && y<8){
      return y*8+x;
   }
   return null;
};

const coord1Dto2D = (index : number) : Square|null =>{
   let square : Square;
   if(index >= 0 && index < 64){
      square.x = index%8;
      square.y = Math.floor(index/8)
      return square;
   }
   return null;
};

export const getPieceType = (piece : string) : PieceTypes =>{
   let type = piece.toLowerCase();
   if(type === PieceTypes.ROOK || type===PieceTypes.KNIGTH || type === PieceTypes.BISHOP || type===PieceTypes.PAWN || type === PieceTypes.KING || type===PieceTypes.QUEEN){
      return type; 
   }else{
      return PieceTypes.NO_PIECE;
   }
}

const getPieceColor = (piece : string) : Colors =>{
   if(piece === ''){
      return Colors.NO_COLOR;
   }
   return piece === piece.toLowerCase() ? Colors.BLACK: Colors.WHITE;
};

const getPieceOfColor = (piece : string, color : Colors) : string =>{   //return a piece of the color given ('r','w') -> 'R'
   return color === Colors.WHITE ? piece.toUpperCase() : piece.toLowerCase();
};

const getOpositeColor = (color : Colors) : Colors =>{
   if(color !== Colors.NO_COLOR){
      return (color === Colors.WHITE ? Colors.BLACK : Colors.WHITE);
   }
   return Colors.NO_COLOR;
};

export const startPosition : Position = {
   board: 
      ['r','n','b','q','k','b','n','r',   
      'p','p','p','p','p','p','p','p',    // lowercase -> black  UPPERCASE -> white
       '','','','','','','','',           // p->pawn, n->knight, b->bishop, r->rook, q->queen, k->king
       '','','','','','','','',           //ej p->black pawn, K->white king
       '','','','','','','','',
       '','','','','','','','',
      'P','P','P','P','P','P','P','P', 
      'R','N','B','Q','K','B','N','R'],
   move: Colors.WHITE,                             
   castlingPrivileges:'kqKQ',                  
   enpassantSquare: null,                  
   fiftyMoveRuleCount:0,                    
   halfMoves:0                               
}; 

type GenerateMovesOptions = {
   legal: boolean,      //if true generate only legal moves, else generate pseudo legal(not verify if in check)
   square: Squares|null //if not null generate only for the square specified
};

type Move = {
   from: Squares,
   to: Squares,
   prom: PieceTypes     //in case of promotion indicates to witch type
};

const PIECES_OFFSETS = {
   'p': {'w':-1,'b':1},
   'n': [{x:1,y:2},{x:1,y:-2},{x:-1,y:2},{x:-1,y:-2},{x:2,y:1},{x:2,y:-1},{x:-2,y:1},{x:-2,y:-1},],
   'b': [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}],
   'r': [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],
   'q': [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],
   'k': [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
 };

export const generateMoves = (position : Position, options : GenerateMovesOptions) : Move[] =>{
   let moves : Move[] = [];
   let us    : Colors = position.move;
   let them  : Colors = getOpositeColor(us);

   let secondRank = us === Colors.WHITE ? 6 : 1;
   let firstRank  = us === Colors.WHITE ? 7 : 0;

   let startSquare : Squares = options.square ? options.square : Squares.a8;
   let endSquare : Squares = options.square ? options.square : Squares.h1;

   for( let i = startSquare; i <= endSquare; i++){
      let square = coord1Dto2D(i);
      if(getPieceColor(position.board[i]) === us){
         let piece = getPieceType(position.board[i]);
         if(piece === PieceTypes.PAWN){
            let tmp = square;
            //forwards one square
            tmp.y += PIECES_OFFSETS[PieceTypes.PAWN][us];
            if(getPieceType(position.board[coord2Dto1D(tmp)]) === PieceTypes.NO_PIECE){
               moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
            }
            //attack left
            tmp.x -=1;
            if( onBounds(tmp) && 
            (getPieceColor(position.board[coord2Dto1D(tmp)]) === them ||
             position.enpassantSquare === coord2Dto1D(tmp))){
               moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
            }
            //atack right
            tmp.x+=2;
            console.log(tmp);
            console.log(onBounds(tmp));
            console.log(coord2Dto1D(tmp));
            if( onBounds(tmp) && 
            (getPieceColor(position.board[coord2Dto1D(tmp)]) === them ||
             position.enpassantSquare === coord2Dto1D(tmp))){
               moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
            }
            //long pawn move
            tmp.x-=1;
            tmp.y+=PIECES_OFFSETS[PieceTypes.PAWN][us];
            if(square.y === secondRank && 
               getPieceType(position.board[coord2Dto1D(tmp)]) === PieceTypes.NO_PIECE){
               moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
            }
         }else {
            for(let j = 0; j<PIECES_OFFSETS[piece].length; j++){
               let tmp = square;
               let offset = PIECES_OFFSETS[piece][j];
               while(onBounds(tmp)){
                  tmp.x+=offset.x;
                  tmp.y+=offset.y
                  let p = position.board[coord2Dto1D(tmp)];
                  if(p === PieceTypes.NO_PIECE){
                     moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
                  }else if(getPieceColor(p) === them){
                     moves.push({from:i, to:coord2Dto1D(tmp), prom:null});
                     break;
                  }else{
                     break;
                  }
                  if(piece === PieceTypes.KNIGTH || piece === PieceTypes.KING){
                     break;
                  }
               }
            }

         }
         //kingside castling
         if(piece === PieceTypes.KING && position.castlingPrivileges.includes(us === Colors.WHITE?'K':'k')){
            let e = {x:4, y:firstRank};
            let f = {x:5, y:firstRank};
            let g = {x:5, y:firstRank};
            if(getPieceType(position.board[coord2Dto1D(f)])===PieceTypes.NO_PIECE&&
               getPieceType(position.board[coord2Dto1D(g)])===PieceTypes.NO_PIECE&&
               !isAttackedBy(position.board,e,them)&&
               !isAttackedBy(position.board,g,them)){
                  moves.push({from:i, to:coord2Dto1D(g), prom:null});
               }
         }
         //queenside castling
         if(piece === PieceTypes.KING && position.castlingPrivileges.includes(us === Colors.WHITE?'Q':'q')){
            let e = {x:4, y:firstRank};
            let d = {x:3, y:firstRank};
            let c = {x:2, y:firstRank};
            let b = {x:1, y:firstRank};
            if(getPieceType(position.board[coord2Dto1D(d)])===PieceTypes.NO_PIECE&&
               getPieceType(position.board[coord2Dto1D(c)])===PieceTypes.NO_PIECE&&
               getPieceType(position.board[coord2Dto1D(b)])===PieceTypes.NO_PIECE&&
               !isAttackedBy(position.board,e,them)&&
               !isAttackedBy(position.board,d,them)){
                  moves.push({from:i, to:coord2Dto1D(c), prom:null});
               }
         }
      }
   }
   if(options.legal){
      let legalMoves : Move[] = [];
      moves.forEach((element)=>{
         let newPosition = cloneDeep(position);
         performMove(newPosition, element.from, element.to);
         if(!isOnCheck(newPosition.board, newPosition.move)){
            legalMoves.push(element);
         }
      });
      return legalMoves;
   }
   return moves;
}












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
      if(start.square.x-end.square.x >0){
         board[moveStart] = pieces.NO_PIECE;
         board[coord2Dto1D(0,rank)] = pieces.NO_PIECE;
         board[coord2Dto1D(2,rank)] = getPieceOfColor(pieces.KING, start.pieceColor);
         board[coord2Dto1D(3,rank)] = getPieceOfColor(pieces.ROOK, start.pieceColor);
      }else{
         board[moveStart] = pieces.NO_PIECE;
         board[coord2Dto1D(7,rank)] = pieces.NO_PIECE;
         board[coord2Dto1D(6,rank)] = getPieceOfColor(pieces.KING, start.pieceColor);
         board[coord2Dto1D(5,rank)] = getPieceOfColor(pieces.ROOK, start.pieceColor);
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
   let moveNotation = getMoveNotation(position, start, end);
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
   return moveNotation + (isOnCheck(position.board, position.move) ? '+':'');
}

const getMoveNotation = (position, start, end) =>{


   let movedPieceType = getPieceType(start.piece);
   if(movedPieceType === pieces.PAWN){
      if(end.piece !== pieces.NO_PIECE || coord2Dto1D(end.square.x, end.square.y) === position.enpassantSquare){
         return indexToSquareNotation(coord2Dto1D(start.square.x, start.square.y))[0]+'x'+indexToSquareNotation(coord2Dto1D(end.square.x, end.square.y));
      }else{
         return indexToSquareNotation(coord2Dto1D(end.square.x, end.square.y));
      }
   }else if(movedPieceType === pieces.KING && (Math.abs(start.square.x-end.square.x) >1 || Math.abs(end.square.y-start.square.y) > 1)){
      if(end.square.x > start.square.x){
         return 'O-O'
      }else{
         return 'O-O-O'
      }
   }else{
      return movedPieceType.toUpperCase() + (end.piece !== pieces.NO_PIECE ? 'x' : '') + indexToSquareNotation(coord2Dto1D(end.square.x, end.square.y));
   }

}

export const longToShortAlgebraicNotation = (position, notation) =>{
   let startSquare = squareNotationToIndex(notation.substring(0,2));
   let endSquare = squareNotationToIndex(notation.substring(2,4));
   let start = {                                                        //starting square of the move
      square: coord1Dto2D(startSquare),
      piece: position.board[startSquare],                                 //piece to move
      pieceColor: getPieceColor(position.board[startSquare])
   };

   let end = {                                                        //starting square of the move
      square: coord1Dto2D(endSquare),
      piece: position.board[endSquare],                                 //piece to move
      pieceColor: getPieceColor(position.board[endSquare])
   };
   return getMoveNotation(position, start, end);
}


const checkPath = (board  : string[],
                   start  : Square,
                   offset : {x: number, y: number}) : {pieceHit: string, distance:number} =>{  

   let i        : number = 0;
   let tmp      : Square = start;
   let piece    : string;

   while(onBounds(tmp)){
      i++;
      tmp.x+= offset.x;
      tmp.y+= offset.y;
      piece = board[coord2Dto1D(tmp)];
      if(piece !== PieceTypes.NO_PIECE){
         return {pieceHit:piece, distance:i};
      }
   }

   return {pieceHit: PieceTypes.NO_PIECE, distance:0};
};

//return true if color is attacking square
const isAttackedBy = (position : Position, square : Squares, color : Colors) : boolean =>{ 
   if(square === position.enpassantSquare){
      return true;
   }
   
   let pos = coord1Dto2D(square)

   let queen = getPieceOfColor(PieceTypes.QUEEN,color);
   let rook = getPieceOfColor(PieceTypes.ROOK, color);
   let knight = getPieceOfColor(PieceTypes.KNIGTH, color);
   let bishop = getPieceOfColor(PieceTypes.BISHOP, color);
   let pawn = getPieceOfColor(PieceTypes.PAWN, color);
   let king = getPieceOfColor(PieceTypes.KING, color);

   let offset : {x:number, y:number};
   let result : {pieceHit : string, distance : number};
   let board = position.board;
   //horizontal direction
   offset.x = 1;
   offset.y = 0;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === rook || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   offset.x = -1;
   offset.y = 0;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === rook || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   //vertical direction
   offset.x = 0;
   offset.y = 1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === rook || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   offset.x = 0;
   offset.y = -1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === rook || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   //diagonals
   offset.x = 1;
   offset.y = 1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === bishop || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   offset.x = -1;
   offset.y = 0;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === bishop || (result.pieceHit === king && result.distance === 1)){
      return true;
   }
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
   return ( 8-parseInt(square[1]) )*8 + square.charCodeAt(0) - 97;
}

export const indexToSquareNotation = (index) =>{
   let x = index % 8;
   let y = Math.floor(index/8);
   return String.fromCharCode(x+97).concat(8-y);
}