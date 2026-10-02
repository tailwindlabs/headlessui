import path from 'path'
import ts from 'typescript'

it('preserves union option types without inferring them from callbacks or virtual options', () => {
  let file = path.join(__dirname, 'combobox-consumer.tsx')
  let source = `
    import React from 'react'
    import { Combobox } from './combobox'

    type Option = { label: string; value: string; disabled?: boolean }
    type Value = string | Option
    const getValue = (option: Value) => typeof option === 'string' ? option : option.value
    const compare = (a: Value, b: Value) => getValue(a) === getValue(b)
    const disabled = (option: Value) => typeof option === 'object' && !!option.disabled
    declare const multiple: boolean
    declare const options: Option[]
    declare const values: Value[]

    // A wrapper forwarding a boolean multiple prop must accept the actual option type.
    ;<Combobox<Value, boolean> multiple={multiple} by={compare} virtual={{ options, disabled }} />
    ;<Combobox<Value, true> multiple by={compare} virtual={{ options, disabled }} />
    ;<Combobox<Value, false> multiple={false} by={compare} virtual={{ options, disabled }} />
    ;<Combobox multiple value={values} by={compare} virtual={{ options, disabled }} />

    type Item = { id: number; label: string } | { id: number; name: string }
    const byId = (a: Item, b: Item) => a.id === b.id
    ;<Combobox<Item, boolean> multiple={multiple} by={byId} virtual={{ options: [{ id: 1, label: 'one' }] }} />

    // Incompatible callbacks must not be accepted or widen the selected value's type.
    // @ts-expect-error A numeric comparator cannot compare string or object options.
    ;<Combobox<Value, boolean> multiple={multiple} by={(a: number, b: number) => a === b} />
    // @ts-expect-error A numeric disabled callback cannot inspect string or object options.
    ;<Combobox<Value, boolean> multiple={multiple} virtual={{ options, disabled: (n: number) => n < 0 }} />
    // @ts-expect-error Numeric options are outside the explicitly declared value union.
    ;<Combobox<Value, boolean> multiple={multiple} virtual={{ options: [123] }} />
    // @ts-expect-error by must not infer a narrower type than the selected values.
    ;<Combobox multiple value={values} by={(a: Option, b: Option) => a.value === b.value} />
    // @ts-expect-error disabled must not infer a narrower type than the selected values.
    ;<Combobox multiple value={values} virtual={{ options, disabled: (o: Option) => !!o.disabled }} />
    // @ts-expect-error virtual options must not widen the inferred selected value type.
    ;<Combobox multiple value={['one']} virtual={{ options: [123] }} />
  `
  let options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
  }
  let host = ts.createCompilerHost(options)
  let getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) =>
    name === file
      ? ts.createSourceFile(name, source, languageVersion, true, ts.ScriptKind.TSX)
      : getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile)

  let program = ts.createProgram([file], options, host)
  let diagnostics = ts.getPreEmitDiagnostics(program)
  expect(
    ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (name) => path.relative(__dirname, name),
      getCurrentDirectory: () => __dirname,
      getNewLine: () => '\n',
    })
  ).toBe('')
})
