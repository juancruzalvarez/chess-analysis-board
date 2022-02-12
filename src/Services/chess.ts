import cloneDeep from 'lodash/cloneDeep'
import parseInt from 'lodash/parseInt'

enum Squares{
   a8= 0,
      b8,c8,d8,e8,f8,g8,h8,
   a7,b7,c7,d7,e7,f7,g7,h7,
   a6,b6,c6,d6,e6,f6,g6,h6,
   a5,b5,c5,d5,e5,f5,g5,h5,
   a4,b4,c4,d4,e4,f4,g4,h4,
   a3,b3,c3,d3,e3,f3,g3,h3,
   a2,b2,c2,d2,e2,f2,g2,h2,
   a1,b1,c1,d1,e1,f1,g1,h1,
   NO_SQUARE
}

export enum PieceTypes{
   NO_PIECE = '',
   PAWN     = 'p',
   KNIGTH   = 'n',
   BISHOP   = 'b',
   ROOK     = 'r',
   QUEEN    = 'q',
   KING     = 'k'
};

export enum Colors{
   NO_COLOR = '',
   WHITE    = 'w',
   BLACK    = 'b'
};

enum GameTerminations{
   NOT_DONE,
   DRAW,
   CHECKMATE
};

type Position = {
   board: string[],            //array holding pieces positions
   move: Colors,               //whose move it is in the position
   castlingPrivileges: string, //determinates how can white and black castle, representing white with uppercase and black with lowecase.
                               // ej: 'kqK' white can castle kingside and black to both sides
                               // ej: 'Qk white can castle queenside and black kingside
   enpassantSquare: number,    //holds the square witch can be captured enpassant, for most of the game null.
   fiftyMoveRuleCount: number, //holds the number of moves without captures or pawn pushes.
   halfMoves: number           //number of halfmoves since the start of the game.
};

type Square = {
   x: number,
   y: number
}

const onBounds = ({x,y}: Square): boolean => x>=0&&x<8&&y>=0&&y<8;

const coord2Dto1D = ({x,y}: Square): number|null =>{
   if(x>=0 && x<8 &&y>=0 && y<8){
      return y*8+x;
   }
   return null;
};

const coord1Dto2D = (index: number): Square|null =>{
   if(index >= 0 && index < 64){
      return {x:index%8, y:Math.floor(index/8)};
   }
   return null;
};

export const getPieceType = (piece: string): PieceTypes =>{
   if(piece){
      let type = piece.toLowerCase();
      if(type === PieceTypes.ROOK || type===PieceTypes.KNIGTH || type === PieceTypes.BISHOP || type===PieceTypes.PAWN || type === PieceTypes.KING || type===PieceTypes.QUEEN){
         return type; 
      }else{
         return PieceTypes.NO_PIECE;
      }
   }else{
      return PieceTypes.NO_PIECE;
   }
}

export const getPieceColor = (piece: string): Colors =>{
   if(!piece){
      return Colors.NO_COLOR;
   }
   return piece === piece.toLowerCase() ? Colors.BLACK: Colors.WHITE;
};

export const getPieceOfColor = (piece: string, color: Colors): string =>{   //return a piece of the color given ('r','w') -> 'R'
   return color === Colors.WHITE ? piece.toUpperCase() : piece.toLowerCase();
};

const getOpositeColor = (color: Colors): Colors =>{
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
   castlingPrivileges: 'kqKQ',                  
   enpassantSquare: null,                  
   fiftyMoveRuleCount: 0,                    
   halfMoves: 0                               
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

const generateMoves = (position: Position, options: GenerateMovesOptions): Move[] =>{

   let moves: Move[] = [];
   let us: Colors    = position.move;
   let them: Colors  = getOpositeColor(us);

   let secondRank = us === Colors.WHITE ? 6 : 1;
   let firstRank  = us === Colors.WHITE ? 7 : 0;

   let startSquare : Squares = options.square ? options.square : Squares.a8;
   let endSquare : Squares = options.square ? options.square : Squares.h1;

   const addPawnMove = (from: Squares, to: Squares) =>{
      let square = coord1Dto2D(to);
      if(square.y === 0 || square.y ===7){
         moves.push({from:from, to:to, prom:PieceTypes.KNIGTH});
         moves.push({from:from, to:to, prom:PieceTypes.BISHOP});
         moves.push({from:from, to:to, prom:PieceTypes.ROOK});
         moves.push({from:from, to:to, prom:PieceTypes.QUEEN});
      }else{
         moves.push({from:from, to:to, prom:null});
      }
   }
   for( let i = startSquare; i <= endSquare; i++){
      let square = coord1Dto2D(i);
      if(getPieceColor(position.board[i]) === us){
         let piece = getPieceType(position.board[i]);
         if(piece === PieceTypes.PAWN){
            let tmp = {...square};
            //forwards one square
            tmp.y += PIECES_OFFSETS[PieceTypes.PAWN][us];
            if(getPieceType(position.board[coord2Dto1D(tmp)]) === PieceTypes.NO_PIECE){
               addPawnMove(i, coord2Dto1D(tmp));
               //long pawn move
               tmp.y+=PIECES_OFFSETS[PieceTypes.PAWN][us];

               if(square.y === secondRank && 
                  getPieceType(position.board[coord2Dto1D(tmp)]) === PieceTypes.NO_PIECE){
                  addPawnMove(i, coord2Dto1D(tmp));
               }
               

               tmp.y-=PIECES_OFFSETS[PieceTypes.PAWN][us];
            }
            //attack left
            tmp.x -=1;
            if( onBounds(tmp) && 
            (getPieceColor(position.board[coord2Dto1D(tmp)]) === them ||
             position.enpassantSquare === coord2Dto1D(tmp))){
               addPawnMove(i, coord2Dto1D(tmp));
            }
            //atack right
            tmp.x+=2;
            if( onBounds(tmp) && 
            (getPieceColor(position.board[coord2Dto1D(tmp)]) === them ||
             position.enpassantSquare === coord2Dto1D(tmp))){
               addPawnMove(i, coord2Dto1D(tmp));
            }
            
         }else {
            for(let j = 0; j<PIECES_OFFSETS[piece].length; j++){
               let tmp = {...square};
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
            let g = {x:6, y:firstRank};
            if(getPieceType(position.board[coord2Dto1D(f)])===PieceTypes.NO_PIECE&&
               getPieceType(position.board[coord2Dto1D(g)])===PieceTypes.NO_PIECE&&
               !isAttackedBy(position,coord2Dto1D(e),them)&&
               !isAttackedBy(position,coord2Dto1D(g),them)){
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
               !isAttackedBy(position,coord2Dto1D(e),them)&&
               !isAttackedBy(position,coord2Dto1D(d),them)){
                  moves.push({from:i, to:coord2Dto1D(c), prom:null});
               }
         }
      }
   }
   if(options.legal){
      let legalMoves: Move[] = [];
      moves.forEach((element)=>{
         let newPosition: Position =  makeMove(position, element);
         if(!isOnCheck(newPosition, position.move)){
            legalMoves.push(element);
         }
      });

      return legalMoves;
      
   }

   return moves;  
}

const checkPath = (board: string[],
   start: Square,
   offset: {x: number, y: number} 
): {pieceHit: string, distance:number} =>{  

   let i        : number = 0;
   let tmp      : Square = {...start};
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
const isAttackedBy = (position: Position, square: Squares, color: Colors): boolean =>{ 
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

   
   let result : {pieceHit : string, distance : number};
   let board = position.board;
   //horizontal direction
   let offset : {x:number, y:number} = {x:1, y:0};
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
   offset.y = 1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === bishop || (result.pieceHit === king && result.distance === 1)){
      return true;
   }
   offset.x = 1;
   offset.y = -1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === bishop || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   offset.x = -1;
   offset.y = -1;
   result = checkPath(board, pos, offset);
   if(result.pieceHit === queen || result.pieceHit === bishop || (result.pieceHit === king && result.distance === 1)){
      return true;
   }

   //pawn attacks
   let pawnOffsets = color === Colors.WHITE ? [{x:1,y:1},{x:-1,y:1}] : [{x:1,y:-1},{x:-1,y:-1}];
   let tmp : Square;
   for(const offset of pawnOffsets){
      tmp = {...pos};
      tmp.x+=offset.x;
      tmp.y+=offset.y;
      if(onBounds(tmp) && board[coord2Dto1D(tmp)] === pawn){
         return true;
      }
   }

   //knight attacks
   for(const offset of PIECES_OFFSETS[PieceTypes.KNIGTH]){
      tmp = {...pos};
      tmp.x+=offset.x;
      tmp.y+=offset.y;
      if(onBounds(tmp) && board[coord2Dto1D(tmp)] === knight){
         return true;
      }
   }

   return false;
};

const isOnCheck = (position: Position, color: Colors)=>{    
   let king = getPieceOfColor(PieceTypes.KING, color);
   let kingSquare = position.board.findIndex((element)=>element === king);
   return isAttackedBy(position, kingSquare, getOpositeColor(color));
};

export const isMoveValid = (position: Position, move: Move): boolean =>{
   let generationOptions : GenerateMovesOptions = {
      square: move.from,
      legal: true
   };
   const equals = (element: Move) =>{
      return element.from === move.from && element.to === move.to && element.prom === move.prom;
   }
   return generateMoves(position, generationOptions).some(equals);
};

export const makeMove = (position: Position, move: Move): Position =>{

   let newPosition: Position = cloneDeep(position);

   let start = {                      
      square: coord1Dto2D(move.from),
      piece: position.board[move.from],  
      pieceColor: getPieceColor(position.board[move.from])
   };

   let end = {  
      square: coord1Dto2D(move.to),
      piece: position.board[move.to],  
      pieceColor: getPieceColor(position.board[move.to])
   };

   newPosition.fiftyMoveRuleCount++;
   newPosition.halfMoves++;
   newPosition.enpassantSquare = null;
   let pieceMoved: PieceTypes = getPieceType(start.piece);
   switch(pieceMoved){
      case PieceTypes.PAWN: {
         newPosition.fiftyMoveRuleCount = 0;
         if(Math.abs(end.square.y-start.square.y) === 2){
            newPosition.enpassantSquare = start.pieceColor === Colors.WHITE ? coord2Dto1D({x:end.square.x, y:end.square.y+1}) : coord2Dto1D({x:end.square.x, y:end.square.y-1});
         }else{
            newPosition.enpassantSquare = null;
         }
         
         newPosition.board[move.to] = move.prom ? getPieceOfColor(move.prom, end.square.y === 0 ? Colors.WHITE : Colors.BLACK ):start.piece;
         newPosition.board[move.from] = PieceTypes.NO_PIECE;
         if(start.square.x !== end.square.x && end.piece === PieceTypes.NO_PIECE){  //enpassant
            let tmp = end.square;
            tmp.y += start.pieceColor === Colors.WHITE ? 1 : -1;
            newPosition.board[coord2Dto1D(tmp)] = PieceTypes.NO_PIECE;
         }
         break;
      }
      case PieceTypes.KING: {
         if(start.pieceColor === Colors.WHITE){
            newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('K','');
            newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('Q','');
         }else{
            newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('k','');
            newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('q','');
         }
         if(Math.abs(start.square.x-end.square.x) >1){   //castle
            let rank = start.pieceColor === Colors.WHITE ? 7 : 0;
            if(start.square.x-end.square.x >0){
               newPosition.board[move.from] = PieceTypes.NO_PIECE;
               newPosition.board[coord2Dto1D({x:0,y:rank})] = PieceTypes.NO_PIECE;
               newPosition.board[coord2Dto1D({x:2,y:rank})] = getPieceOfColor(PieceTypes.KING, start.pieceColor);
               newPosition.board[coord2Dto1D({x:3,y:rank})] = getPieceOfColor(PieceTypes.ROOK, start.pieceColor);
            }else{
               newPosition.board[move.from] = PieceTypes.NO_PIECE;
               newPosition.board[coord2Dto1D({x:7,y:rank})] = PieceTypes.NO_PIECE;
               newPosition.board[coord2Dto1D({x:6,y:rank})] = getPieceOfColor(PieceTypes.KING, start.pieceColor);
               newPosition.board[coord2Dto1D({x:5,y:rank})] = getPieceOfColor(PieceTypes.ROOK, start.pieceColor);
            } 
         }else{
            newPosition.board[move.to] = start.piece;
            newPosition.board[move.from] = PieceTypes.NO_PIECE;
         }
         break;
      }
      case PieceTypes.ROOK: {
         if(start.pieceColor === Colors.WHITE){
            if(move.from === Squares.a1){
               newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('Q','');
            }else if(move.from === Squares.h1){
               newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('K','');
            }
         }else{
            if(move.from === Squares.a8){
               newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('q','');
            }else if(move.from === Squares.h8){
               newPosition.castlingPrivileges = newPosition.castlingPrivileges.replace('k','');
            }
         }
         newPosition.board[move.to] = start.piece;
         newPosition.board[move.from] = PieceTypes.NO_PIECE;
         break;
      }
      default: {
         newPosition.board[move.to] = start.piece;
         newPosition.board[move.from] = PieceTypes.NO_PIECE;
         break;
      }
   }
   newPosition.move = getOpositeColor(newPosition.move);

   return newPosition;
};

export const getMoveNotation = (position: Position, move: Move): string =>{
   let movedPieceType = getPieceType(position.board[move.from]);
   let startSquare = coord1Dto2D(move.from);
   let endSquare = coord1Dto2D(move.to);
   let moveNotation: string;
  
   if(movedPieceType === PieceTypes.KING && (Math.abs(startSquare.x-endSquare.x) >1 || Math.abs(endSquare.y-startSquare.y) > 1)){
      if(move.to > move.from){
         moveNotation= 'O-O'
      }else{
         moveNotation= 'O-O-O'
      }
   }else if (movedPieceType === PieceTypes.PAWN){
      if(position.board[move.to] !== PieceTypes.NO_PIECE || move.to === position.enpassantSquare){
         moveNotation= indexToSquareNotation(move.from)[0] + 'x' + indexToSquareNotation(move.to);
      }else{
         moveNotation= indexToSquareNotation(move.to);
      }
   }else{
      moveNotation = movedPieceType.toUpperCase() + (position.board[move.to] !== PieceTypes.NO_PIECE ? 'x' : '') + indexToSquareNotation(move.to);
   }
   
   let newPosition: Position = makeMove(position, move);
   let termination: GameTerminations = gameTermination(newPosition);
  
   if(termination === GameTerminations.CHECKMATE){
      moveNotation+='#';
   }else if(isOnCheck(newPosition, newPosition.move)){
      moveNotation+='+';
   }
   return moveNotation;
   

}

export const longToShortAlgebraicNotation = (position: Position, notation: string) =>{

   let startSquare = squareNotationToIndex(notation.substring(0,2));
   let endSquare = squareNotationToIndex(notation.substring(2,4));
   let move: Move = {from:startSquare, to: endSquare, prom: null};
   return getMoveNotation(position, move);
}

export const getPositionFromFEN = (fen: string): Position =>{
   let position: Position;
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
   position.move = split[1] === 'w' ? Colors.WHITE : Colors.BLACK;
   position.castlingPrivileges = split[2];
   position.enpassantSquare = split[3] === '-' ? null : squareNotationToIndex(split[3]);
   position.fiftyMoveRuleCount = parseInt(split[4]);
   return position;
}

export const getFENfromPosition = (position: Position): string =>{
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

export const squareNotationToIndex = (square: string): Squares => {
   return ( 8-parseInt(square[1]) )*8 + square.charCodeAt(0) - 97;
}

const indexToSquareNotation = (index: Squares): string =>{
   let square: Square = coord1Dto2D(index);
   return String.fromCharCode(square.x+97).concat((8-square.y).toString());
}

const gameTermination = (position: Position): GameTerminations =>{
   if(generateMoves(position, {square:null, legal:true}).length === 0){
      if(isOnCheck(position, position.move)){
         return GameTerminations.CHECKMATE;
      }else{
         return GameTerminations.DRAW; //stalemate
      }
   }
   if(position.fiftyMoveRuleCount >=50){
      return GameTerminations.DRAW;
   }
   return GameTerminations.NOT_DONE;
}