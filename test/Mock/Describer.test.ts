import { Describer } from '../../src/Mock/ProviderMock';

test('Null', () => {
  let obj = null;
  let result = Describer.describe(obj);
  expect(result).toEqual([]);
  obj = undefined;
  result = Describer.describe(obj);
  expect(result).toEqual([]);
});

test('Object', () => {
  const obj = {
    a: 5,
    b: () => 5,
    c: [],
  };
  const result = Describer.describe(obj);
  expect(result.sort()).toEqual(['a', 'b', 'c'].sort());
});

test('Function', () => {
  let obj: any = (a: any) => 5;
  let result = Describer.describe(obj);
  expect(result).toEqual([
    'length',
    'name',
    'prototype',
    'arguments',
    'caller',
    'constructor',
    'apply',
    'bind',
    'call',
    'toString',
  ]);
  obj = function (a: any) {};
  result = Describer.describe(obj);
  expect(result).toEqual([
    'length',
    'name',
    'prototype',
    'arguments',
    'caller',
    'constructor',
    'apply',
    'bind',
    'call',
    'toString',
  ]);
});

test('String', () => {
  const obj = 'hello';
  const result = Describer.describe(obj);
  expect(result).toEqual([
    '0',
    '1',
    '2',
    '3',
    '4',
    'length',
    'constructor',
    'anchor',
    'big',
    'blink',
    'bold',
    'charAt',
    'charCodeAt',
    'codePointAt',
    'concat',
    'endsWith',
    'fontcolor',
    'fontsize',
    'fixed',
    'includes',
    'indexOf',
    'italics',
    'lastIndexOf',
    'link',
    'localeCompare',
    'match',
    'matchAll',
    'normalize',
    'padEnd',
    'padStart',
    'repeat',
    'replace',
    'replaceAll',
    'search',
    'slice',
    'small',
    'split',
    'strike',
    'sub',
    'substr',
    'substring',
    'sup',
    'startsWith',
    'toString',
    'trim',
    'trimStart',
    'trimLeft',
    'trimEnd',
    'trimRight',
    'toLocaleLowerCase',
    'toLocaleUpperCase',
    'toLowerCase',
    'toUpperCase',
    'valueOf',
    'at',
  ]);
});

test('Number', () => {
  const obj = 6;
  const result = Describer.describe(obj);
  expect(result).toEqual([
    'constructor',
    'toExponential',
    'toFixed',
    'toPrecision',
    'toString',
    'valueOf',
    'toLocaleString',
  ]);
});

class A {
  private a: any = 5;

  constructor() {}

  set ay(v: any) {}

  get ay() {
    return undefined;
  }

  callA() {}
}

test('Class', () => {
  const obj = new A();
  const result = Describer.describe(obj);
  expect(result.sort()).toEqual(['constructor', 'a', 'callA', 'ay'].sort());
});

class B extends A {
  private b: any = 5;

  constructor() {
    super();
  }

  callB() {}
}

test('Class inheriting once', () => {
  const obj = new B();
  const result = Describer.describe(obj);
  expect(result.sort()).toEqual(['constructor', 'a', 'callA', 'b', 'callB', 'ay'].sort());
});

class C extends B {
  private c: any = 5;

  constructor() {
    super();
  }

  callC() {}
}

test('Class inheriting twice', () => {
  const obj = new C();
  const result = Describer.describe(obj);
  expect(result.sort()).toEqual(['constructor', 'a', 'callA', 'b', 'callB', 'c', 'callC', 'ay'].sort());
});
