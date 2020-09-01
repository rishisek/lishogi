
import { EditorConfig, EditorOptions, EditorState, Selected, Redraw, OpeningPosition } from './interfaces';
import { Api as CgApi } from 'shogiground/api';

//import { Setup, Material, RemainingChecks } from 'shogiops/setup';
//import { setupPosition } from 'shogiops/variant';

import { prop, Prop } from 'common';
import { initialFen, breakSfen, fixSfen } from 'shogiutil/util'
import { GameSituation } from 'shogiutil/types'
// @ts-ignore
import { Init } from 'shogiutil/vendor/shogijs.js'


export default class EditorCtrl {
  cfg: EditorConfig;
  options: EditorOptions;
  trans: Trans;
  extraPositions: OpeningPosition[];
  shogiground: CgApi | undefined;
  redraw: Redraw;

  selected: Prop<Selected>;

  turn: Color;

  constructor(cfg: EditorConfig, redraw: Redraw) {
    this.cfg = cfg;
    this.options = cfg.options || {};

    this.trans = window.lichess.trans(this.cfg.i18n);

    this.selected = prop('pointer');

    this.extraPositions = [{
      fen: initialFen,
      epd: '1',
      name: this.trans('startPosition')
    }, {
      fen: 'prompt',
      name: this.trans('loadPosition')
    }];

    if (cfg.positions) {
      cfg.positions.forEach(p => p.epd = p.fen.split(' ').splice(0, 4).join(' '));
    }

    window.Mousetrap.bind('f', (e: Event) => {
      e.preventDefault();
      if (this.shogiground) this.shogiground.toggleOrientation();
      redraw();
    });

    this.redraw = () => { };
    this.setFen(cfg.fen);
    this.redraw = redraw;
  }

  onChange(): void {
    const fen = this.getFen();
    if (!this.cfg.embed) {
      if (fen == initialFen) window.history.replaceState('crazyhouse', '', '/editor');
      else window.history.replaceState('crazyhouse', '', this.makeUrl('/editor/', fen));
    }
    this.options.onChange && this.options.onChange(fen);
    this.redraw();
  }

  private getSetup(): GameSituation {
    var boardFen = this.shogiground ? this.shogiground.getFen() : this.cfg.fen;
    console.log(boardFen)
    console.log(breakSfen(boardFen))
    const gs = Init.init(breakSfen(boardFen));
    this.turn = gs.player;
    return gs;
  }

  getFen(): string {
    return fixSfen(this.getSetup().fen);
  }

  private getLegalFen(): string {
    return this.getFen();
  }

  private isPlayable(): boolean {
    const gs = this.getSetup();
    return gs.playable && gs.validity!;
  }

  getState(): EditorState {
    return {
      fen: this.getFen(),
      legalFen: this.getLegalFen(),
      playable: this.isPlayable(),
    };
  }

  makeAnalysisUrl(legalFen: string): string {
    return this.makeUrl(`/analysis/crazyhouse/`, legalFen);
  }

  makeUrl(baseUrl: string, fen: string): string {
    return baseUrl + encodeURIComponent(fen).replace(/%20/g, '_').replace(/%2F/g, '/');
  }

  bottomColor(): Color {
    return this.shogiground ?
      this.shogiground.state.orientation :
      this.options.orientation || 'white';
  }

  setTurn(turn: Color): void {
    this.turn = turn;
    this.onChange();
  }

  startPosition(): void {
    this.setFen('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1');
  }

  clearBoard(): void {
    this.setFen('9/9/9/9/9/9/9/9/9');
  }

  loadNewFen(fen: string | 'prompt'): void {
    if (fen === 'prompt') {
      fen = (prompt('Paste FEN position') || '').trim();
      if (!fen) return;
    }
    this.setFen(fen);
  }

  setFen(fen: string): boolean {
    if (this.shogiground) this.shogiground.set({ fen });
    this.onChange();
    return true;
  }

  setOrientation(o: Color): void {
    this.options.orientation = o;
    if (this.shogiground!.state.orientation !== o) this.shogiground!.toggleOrientation();
    this.redraw();
  }
}
