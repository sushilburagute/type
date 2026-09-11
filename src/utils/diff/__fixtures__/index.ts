export interface DiffFixture {
  a: string
  b: string
}

export const identical: DiffFixture = {
  a: 'alpha\nbeta\ngamma',
  b: 'alpha\nbeta\ngamma',
}

export const addOnly: DiffFixture = {
  a: 'alpha\ngamma',
  b: 'alpha\nbeta\ngamma\ndelta',
}

export const removeOnly: DiffFixture = {
  a: 'alpha\nbeta\ngamma\ndelta',
  b: 'alpha\ngamma',
}

export const singleModifiedLine: DiffFixture = {
  a: 'const a = 1\nconst b = 2\nconst c = 3',
  b: 'const a = 1\nconst b = 20\nconst c = 3',
}

export const movedBlock: DiffFixture = {
  a: 'x\ny\nz\n1\n2',
  b: '1\n2\nx\ny\nz',
}

/** same content, different line endings → identical */
export const crlfVsLf: DiffFixture = {
  a: 'alpha\r\nbeta\r\ngamma\r\n',
  b: 'alpha\nbeta\ngamma\n',
}

export const emptyVsText: DiffFixture = {
  a: '',
  b: 'alpha\nbeta',
}

export const textVsEmpty: DiffFixture = {
  a: 'alpha\nbeta',
  b: '',
}

/** a single trailing newline does not count as a line → identical */
export const trailingNewline: DiffFixture = {
  a: 'a\nb',
  b: 'a\nb\n',
}

export const unicode: DiffFixture = {
  a: 'héllo 👋 wörld\n日本語のテキスト\nünchanged',
  b: 'héllo 🌍 wörld\n日本語の文章\nünchanged',
}

/** 3 removed lines followed by 2 added lines → 2 modify + 1 remove */
export const multiModify: DiffFixture = {
  a: 'keep\none\ntwo\nthree\nkeep',
  b: 'keep\nuno\ndos\nkeep',
}

export const bothEmpty: DiffFixture = {
  a: '',
  b: '',
}
