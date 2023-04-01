import { GENERATOR, State } from "astring";

export const ANGULAR_GENERATOR: typeof GENERATOR = {
  ...GENERATOR,
  ['NGPipeExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    t[node.right.type](node.right, state); // pipe name
    state.write('(');
    const args = [node.left, ...node.arguments];
    for (let i in args) {
      const arg = args[i];
      t[arg.type](arg, state);
      if (+i < args.length - 1) state.write(', ');
    }
    state.write(')');
  },
  ['NGMicrosyntax' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    for (let i in node.body) {
      const bodyNode = node.body[i];
      t[bodyNode.type](bodyNode, state);
      if (+i < node.body.length - 1) state.write(',');
    }
  },
  ['NGMicrosyntaxExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    t[node.expression.type](node.expression, state);
  },
  ['NGMicrosyntaxKey' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write(`"${node.name}"`);
  },
  ['NGMicrosyntaxKeyedExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    t[node.key.type](node.key, state);
    state.write(',');
    t[node.expression.type](node.expression, state);
  },
  ['NGChainedExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    for (let i in node.expressions) {
      const expression = node.expressions[i];
      t[expression.type](expression, state);
      if (+i < node.expressions.length - 1) state.write(',');
    }
  },
  ['NGMicrosyntaxLet' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write('"let"');
  },
  ['NGMicrosyntaxAs' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write('"as"');
  },
  ['NGEmptyExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {},
  // possible type, but not used in the parser
  // ['NGQuotedExpression' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {},
  ['ObjectProperty' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    const t = this as any;
    t[node.key.type](node.key, state);
    state.write(': ');
    t[node.value.type](node.value, state);
  },
  ['StringLiteral' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write('"');
    state.write(node.value);
    state.write('"');
  },
  ['NumericLiteral' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write(node.value);
  },
  ['NullLiteral' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write('null');
  },
  ['BooleanLiteral' as any]: function (this: typeof ANGULAR_GENERATOR, node: any, state: State) {
    state.write(node.value ? 'true' : 'false');
  },
  ['OptionalMemberExpression' as any]: GENERATOR['MemberExpression'],
  ['OptionalCallExpression' as any]: GENERATOR['CallExpression'],
};
