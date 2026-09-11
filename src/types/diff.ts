export type SegmentKind = 'equal' | 'add' | 'remove'

export interface Segment {
  text: string
  kind: SegmentKind
}

export interface LineRef {
  /** 1-based line number on its own side */
  n: number
  text: string
}

export type DiffRow =
  | { type: 'equal'; left: LineRef; right: LineRef }
  | { type: 'add'; right: LineRef }
  | { type: 'remove'; left: LineRef }
  | { type: 'modify'; left: LineRef; right: LineRef; leftSegments: Segment[]; rightSegments: Segment[] }

export interface DiffResult {
  rows: DiffRow[]
  added: number
  removed: number
  identical: boolean
}

/** one rendered line in unified mode */
export interface DisplayLine {
  kind: 'equal' | 'add' | 'remove'
  leftN?: number
  rightN?: number
  text: string
  segments?: Segment[]
}

/** one rendered row in split mode: two aligned cells, either may be empty */
export interface SplitRow {
  left?: DisplayLine
  right?: DisplayLine
}
