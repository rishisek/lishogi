import { Hooks } from 'snabbdom/hooks';
import { Puzzle } from './interfaces';
import { opposite } from 'shogiops';
import { parseFen } from 'shogiops/fen';

export function bind(eventName: string, f: (e: Event) => any, redraw?: () => void): Hooks {
  return onInsert(el =>
    el.addEventListener(eventName, e => {
      const res = f(e);
      if (redraw) redraw();
      return res;
    })
  );
}

export function onInsert<A extends HTMLElement>(f: (element: A) => void): Hooks {
  return {
    insert: vnode => f(vnode.elm as A),
  };
}

export const getNow = (): number => Math.round(performance.now());

export const uciToLastMove = (uci: string): [Key, Key] => [uci.substr(0, 2) as Key, uci.substr(2, 2) as Key];

export const puzzlePov = (puzzle: Puzzle) => opposite(parseFen(puzzle.fen).unwrap().turn);

export const loadSound = (file: string, volume?: number, delay?: number) => {
  setTimeout(() => window.lishogi.sound.loadOggOrMp3(file, `${window.lishogi.sound.baseUrl}/${file}`), delay || 1000);
  return () => window.lishogi.sound.play(file, volume);
};

export const sound = {
  move: (take: boolean) => window.lishogi.sound.play(take ? 'capture' : 'move'),
  good: loadSound('lisp/PuzzleStormGood', 0.9, 1000),
  wrong: loadSound('lisp/Error', 0.5, 1000),
  end: loadSound('lisp/PuzzleStormEnd', 1, 5000),
};
