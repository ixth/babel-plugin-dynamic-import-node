import syntax from 'babel-plugin-syntax-dynamic-import';

export default function ({ template, types: t }) {
  const importBuilders = {
    straight: template(`
      Promise.resolve().then(() => require(SOURCE))
    `),
    default: template(`
      Promise.resolve().then(() => ({ __esModule: true, default: require(SOURCE) }))
    `),
  };

  return {
    inherits: syntax,

    visitor: {
      Import(path, state) {
        const mode = state.opts.mode || 'straight';
        const importArguments = path.parentPath.node.arguments;
        const isString = t.isStringLiteral(importArguments[0])
                        || t.isTemplateLiteral(importArguments[0]);
        if (isString) {
          t.removeComments(importArguments[0]);
        }

        const newImport = importBuilders[mode]({
          SOURCE: (isString)
            ? importArguments
            : t.templateLiteral([
              t.templateElement({ raw: '', cooked: '' }),
              t.templateElement({ raw: '', cooked: '' }, true),
            ], importArguments),
        });
        path.parentPath.replaceWith(newImport);
      },
    },
  };
}
