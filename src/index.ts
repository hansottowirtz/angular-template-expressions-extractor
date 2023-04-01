import { Node } from 'angular-html-parser/lib/compiler/src/ml_parser/ast';
import { parse as parseAngularTemplate } from 'angular-html-parser';
import * as angularEstreeParser from 'angular-estree-parser';
import { generate } from 'astring';
import { ANGULAR_GENERATOR } from './generator';

export { ANGULAR_GENERATOR };

type ExpressionType =
  | 'interpolation'
  | 'attr_action'
  | 'attr_binding'
  | 'attr_template'
  | 'attr_structural'
  | 'attr_property';

export async function parseToExpressionsList(templateFileContents: string[]) {
  const expressions: [string, ExpressionType][] = [];

  for (const content of templateFileContents) {
    const tree = parseAngularTemplate(content, { canSelfClose: true });

    for (const node of tree.rootNodes) {
      crawlExtractExpressions(node, (expression, type) => expressions.push([expression, type]));
    }
  }

  const generatedExpressions: string[] = [];

  for (const [expression, type] of expressions) {
    try {
      let ast!: angularEstreeParser.NGNode;
      if (type === 'interpolation') {
        ast = angularEstreeParser.parseInterpolationExpression(expression);
      } else if (type === 'attr_action') {
        ast = angularEstreeParser.parseAction(expression);
      } else if (type === 'attr_binding') {
        ast = angularEstreeParser.parseBinding(expression);
      } else if (type === 'attr_template') {
        ast = angularEstreeParser.parseBinding(expression);
      } else if (type === 'attr_structural') {
        ast = angularEstreeParser.parseTemplateBindings(expression);
      } else {
        throw new Error(`Unknown expression type: ${type}`);
      }
      generatedExpressions.push(generate(ast, { generator: ANGULAR_GENERATOR }));
    } catch (e: any) {
      if (e.message.includes('Unexpected node undefined')) {
        console.warn('Some node parser was undefined, skipping...', expression);
        continue;
      }
      throw e;
    }
  }

  return generatedExpressions;
}

export const parseToJsFileContent = async (templateFileContents: string[]) => {
  const generatedExpressions = await parseToExpressionsList(templateFileContents);

  const file = generatedExpressions.map((x) => ';(' + x + ')').join('\n');

  return file;
}

function crawlExtractExpressions(node: Node, cb: (expression: string, type: ExpressionType) => void) {
  if (node.type === 'text') {
    for (const token of node.tokens) {
      if (token.type === 8 /* TokenType.INTERPOLATION */) {
        cb(token.parts[1], 'interpolation');
      }
    }
  }

  // apparently attribute doesn't exist
  // if (node.type === 'attribute') {}

  if (node.type === 'element') {
    for (const child of node.children) {
      crawlExtractExpressions(child, cb);
    }
    for (const attr of node.attrs) {
      for (const token of attr.valueTokens || []) {
        if (token.type === 17 /* TokenType.ATTR_VALUE_INTERPOLATION */) {
          cb(token.parts[1], 'interpolation');
        }
        if (token.type === 16 /* TokenType.ATTR_VALUE_TEXT */) {
          const first = attr.name[0];
          const type =
            first === '('
              ? 'attr_action'
              : first === '['
              ? 'attr_binding'
              : first === '#'
              ? 'attr_template'
              : first === '*'
              ? 'attr_structural'
              : 'attr_property';
          if (type !== 'attr_property') {
            cb(token.parts[0], type);
          }
        }
      }
    }
  }
}
