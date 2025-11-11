document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const initial = [
    ["♜","♞","♝","♛","♚","♝","♞","♜"],
    ["♟","♟","♟","♟","♟","♟","♟","♟"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["♙","♙","♙","♙","♙","♙","♙","♙"],
    ["♖","♘","♗","♕","♔","♗","♘","♖"]
  ];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
      const piece = initial[r][c];
      if (piece) {
        const span = document.createElement("span");
        span.textContent = piece;
        span.className = r < 2 ? "black-piece" : (r > 5 ? "white-piece" : "");
        sq.appendChild(span);
      }
      board.appendChild(sq);
    }
  }
});