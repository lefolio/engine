const ts = require('typescript');

module.exports = {
  process(src, filename) {
    const output = ts.transpileModule(src, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filename,
    });
    return { code: output.outputText };
  },
};
