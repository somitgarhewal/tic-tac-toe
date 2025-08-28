"use client"
import { useState, useEffect } from "react";

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}


export default function Home() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // X = user, O = computer
  const [difficulty, setDifficulty] = useState("easy"); // easy | hard
  const [animateReset, setAnimateReset] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const winnerObj = calculateWinner(squares);
  const winner = winnerObj?.winner;
  const winLine = winnerObj?.line || [];
  const isDraw = !winner && squares.every(Boolean);

  // Computer move: random (easy) or minimax (hard)
  useEffect(() => {
    if (!xIsNext && !winner && !isDraw) {
      let move;
      if (difficulty === "easy") {
        // Random move
        const empty = squares.map((v, i) => (v ? null : i)).filter((v) => v !== null);
        if (empty.length > 0) {
          move = empty[Math.floor(Math.random() * empty.length)];
        }
      } else {
        // Hard: minimax
        move = findBestMove(squares);
      }
      if (move !== undefined) {
        const nextSquares = squares.slice();
        nextSquares[move] = "O";
        // Delay for realism
        const timer = setTimeout(() => {
          setSquares(nextSquares);
          setXIsNext(true);
          setLastMove(move);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [xIsNext, squares, winner, isDraw, difficulty]);

  // Minimax for hard mode
  function findBestMove(board) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        let score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(board, depth, isMaximizing) {
    const scores = { O: 1, X: -1, draw: 0 };
    const result = calculateWinner(board);
    if (result) return scores[result.winner];
    if (board.every(Boolean)) return scores["draw"];

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = "O";
          best = Math.max(best, minimax(board, depth + 1, false));
          board[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = "X";
          best = Math.min(best, minimax(board, depth + 1, true));
          board[i] = null;
        }
      }
      return best;
    }
  }

  function handleClick(i) {
    if (squares[i] || winner || !xIsNext) return;
    const nextSquares = squares.slice();
    nextSquares[i] = "X";
    setSquares(nextSquares);
    setXIsNext(false);
    setLastMove(i);
  }

  function handleReset() {
    setAnimateReset(true);
    setTimeout(() => {
      setSquares(Array(9).fill(null));
      setXIsNext(true);
      setLastMove(null);
      setAnimateReset(false);
    }, 350);
  }

  function handleDifficultyChange(e) {
    setDifficulty(e.target.value);
    handleReset();
  }

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = xIsNext ? "Your turn (X)" : "Computer's turn (O)";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Tic Tac Toe</h1>
      <div className="mb-4 text-xl font-medium text-gray-700 dark:text-gray-200">{status}</div>
      <div className="mb-4">
        <label className="mr-2 font-medium text-gray-700 dark:text-gray-200">Difficulty:</label>
        <select
          value={difficulty}
          onChange={handleDifficultyChange}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        >
          <option value="easy">Easy</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div
        className={`grid grid-cols-3 gap-2 mb-6 transition-transform duration-300 ${animateReset ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}
      >
        {squares.map((value, i) => (
          <button
            key={i}
            className={`w-20 h-20 bg-white dark:bg-gray-800 border-2 rounded-lg text-3xl font-bold flex items-center justify-center shadow transition-all duration-200
              ${winLine.includes(i) ? 'border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900 animate-pulse' : 'border-gray-300 dark:border-gray-700'}
              ${lastMove === i ? 'scale-110 ring-2 ring-blue-400 dark:ring-blue-600 z-10' : ''}
              hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60`}
            onClick={() => handleClick(i)}
            aria-label={`Square ${i + 1}`}
            disabled={!!squares[i] || !!winner || !xIsNext}
          >
            <span className={`inline-block transition-transform duration-200 ${lastMove === i ? 'scale-125' : ''}`}>{value}</span>
          </button>
        ))}
      </div>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        onClick={handleReset}
      >
        Reset Game
      </button>
    </div>
  );
}
