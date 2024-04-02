import { compileMDX } from 'next-mdx-remote/rsc';
import { syntaxHighlight } from '@/lib/mdx/syntax-highlight';
import { MdxCodeBlock } from '@/lib/mdx/MdxCodeBlock';

export default async function HomePage() {
  const { content, frontmatter } = await compileMDX<{ title: string }>({
    source: `
---
title: MDX Syntax Highlighting
---

Some C code.

\`\`\`c
float Q_rsqrt(float number)
{
  long i;
  float x2, y;
  const float threehalfs = 1.5F;

  x2 = number * 0.5F;
  y  = number;
  i  = * ( long * ) &y;                       // evil floating point bit level hacking
  i  = 0x5f3759df - ( i >> 1 );               // what the fuck?
  y  = * ( float * ) &i;
  y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
  // y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

  return y;
}
\`\`\`

With line numbers.

\`\`\`css {"showLineNumbers": true}
.shiki code span.line-number::before {
  @apply inline-block text-right text-sm text-muted-foreground/60;
  content: attr(data-line);
  width: var(--code-line-numbers-width, --code-line-numbers-width-default);
  margin-right: var(--code-padding);
}
\`\`\`

With filename. Shows how to render custom elements on top of &lt;pre/&gt;.

\`\`\`ts {"filename": "fib.ts"}
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
\`\`\`

Command line.

\`\`\`bash {"commandLine":"2..4"}
ls -l
src
Cargo.toml
\`\`\`
      `.trim(),
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [syntaxHighlight],
        format: 'mdx',
      },
    },
    components: {
      p: (props: React.ComponentProps<'p'>) => (
        <p className="mb-4 leading-7" {...props} />
      ),
      pre: (props: React.HTMLAttributes<HTMLElement>) => (
        <MdxCodeBlock {...props} />
      ),
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-lg flex-col px-4 py-8">
      <h1 className="mb-8 scroll-m-20 text-3xl font-normal tracking-tight">
        {frontmatter.title}
      </h1>
      {content}
    </main>
  );
}
