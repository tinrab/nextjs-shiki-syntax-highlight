import {
  CODE_LINE_COMMAND_CLASS_NAME,
  CODE_LINE_HIGHLIGHT_CLASS_NAME,
  CODE_LINE_NUMBER_CLASS_NAME,
} from '@/lib/constants';
import { getCodeMeta } from '@/lib/mdx/syntax-highlight/code-meta';
import { Element, Node } from 'hast';
import { toString } from 'hast-util-to-string';
import { codeToHast } from 'shiki';
import { visit } from 'unist-util-visit';

export function syntaxHighlight() {
  return async (tree: Node) => {
    const promises: Promise<void>[] = [];

    async function visitor(node: Element, index: number, parent: Element) {
      if (
        !parent ||
        index === null ||
        node.tagName !== 'pre' ||
        node.children.length === 0
      ) {
        return;
      }

      const codeNode = node.children[0];
      if (
        !codeNode ||
        codeNode.type !== 'element' ||
        codeNode.tagName !== 'code' ||
        !codeNode.properties
      ) {
        return;
      }

      const lang = getNodeLanguage(codeNode);
      if (typeof lang !== 'string') {
        return;
      }

      // Handle meta
      const meta = getCodeMeta(codeNode);

      // Make themes.
      // Do any custom tweaks.
      let lightTheme = (await import('shiki/themes/material-theme-lighter.mjs'))
        .default;
      lightTheme = {
        ...lightTheme,
        colors: {
          ...lightTheme.colors,
          // 'editor.background': '#e5e5e5',
        },
      };
      let darkTheme = (await import('shiki/themes/material-theme-darker.mjs'))
        .default;
      darkTheme = {
        ...darkTheme,
        colors: {
          ...darkTheme.colors,
          // 'editor.background': '#171717',
        },
      };

      // Highlight code
      const sourceCode = toString(codeNode).trim();
      const hast = await codeToHast(sourceCode, {
        lang,
        themes: { light: lightTheme, dark: darkTheme },
        transformers: [
          // TODO: Add other transformers, like https://shiki.style/packages/transformers.

          // Code meta transformer
          {
            line(node, line) {
              node.properties['data-line'] = line;
              if (meta.highlight && meta.highlight.lineNumbers.includes(line)) {
                this.addClassToHast(node, CODE_LINE_HIGHLIGHT_CLASS_NAME);
              }
              if (
                meta.showLineNumbers &&
                meta.showLineNumbers.lineNumbers.length === 0
              ) {
                this.addClassToHast(node, CODE_LINE_NUMBER_CLASS_NAME);
              }
              if (
                meta.commandLine &&
                !meta.commandLine.outputLines.includes(line)
              ) {
                this.addClassToHast(node, CODE_LINE_COMMAND_CLASS_NAME);
              }
            },
            code(node) {
              this.addClassToHast(node, `language-${lang}`);
              if (meta.showLineNumbers) {
                if (typeof node.properties['style'] !== 'string') {
                  node.properties['style'] = '';
                }
                node.properties['style'] +=
                  `--code-line-numbers-width:${1 + Math.floor(Math.log10(this.lines.length))}ch;`;
              }
            },
          },
        ],
      });

      // Insert highlighted AST into parent
      const hastPre = hast.children[0] as Element;
      parent.children.splice(index, 1, {
        ...hastPre,
        properties: {
          ...hastPre.properties,
          // Custom properties
          dataFilename: meta.filename,
        },
      });
    }

    visit(tree, 'element', (node: Element, index: number, parent: Element) => {
      promises.push(visitor(node, index, parent));
    });
    await Promise.allSettled(promises);
  };
}

function getNodeLanguage(node: Element): string | undefined {
  if (!Array.isArray(node.properties.className)) {
    return undefined;
  }
  const prefix = 'language-';
  const language = node.properties.className.find(function (d) {
    return typeof d === 'string' && d.startsWith(prefix);
  }) as string | undefined;
  if (typeof language === 'string') {
    return language.slice(prefix.length);
  }
  return language;
}
