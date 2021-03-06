import { Run } from './interfaces';
import { Config as CgConfig } from 'shogiground/config';
import { uciToLastMove } from './util';
import { makeFen } from 'shogiops/fen';
import { shogigroundDests } from 'shogiops/compat';

export const makeCgOpts = (run: Run, canMove: boolean): CgConfig => {
  const cur = run.current;
  const pos = cur.position();
  return {
    fen: makeFen(pos.toSetup()),
    orientation: run.pov,
    turnColor: pos.turn,
    movable: {
      color: run.pov,
      dests: canMove ? shogigroundDests(pos) : undefined,
    },
    check: !!pos.isCheck(),
    lastMove: uciToLastMove(cur.lastMove()),
  };
};
