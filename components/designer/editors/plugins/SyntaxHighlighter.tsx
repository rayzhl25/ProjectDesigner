
import React from 'react';

export interface Token {
  type: string;
  content: string;
}

// Regex definitions for different languages
const LANGUAGES: Record<string, { regex: RegExp; types: string[] }> = {
  html: {
    regex: /(<!--[\s\S]*?-->)|(<\/?[a-z0-9]+)|(>)|(="[^"]*")|("[^"]*")|([a-z\-]+)=/gi,
    types: ['comment', 'tag', 'bracket', 'attr-value', 'string', 'attr-name'],
  },
  css: {
    regex: /(\/\*[\s\S]*?\*\/)|([a-z0-9\-]+)(?=:)|(:)|(;|{|})|(@[a-z]+)|(#[0-9a-f]{3,6})|(\.[a-z0-9\-_]+)/gi,
    types: ['comment', 'property', 'punctuation', 'punctuation', 'keyword', 'color', 'selector'],
  },
  javascript: {
    regex: /(\/\/.*|\/\*[\s\S]*?\*\/)|(["'`].*?["'`])|\b(const|let|var|function|return|if|else|import|export|from|async|await|new|this|class)\b|([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()|(\{|\}|\(|\)|\[|\])|([0-9]+)/g,
    types: ['comment', 'string', 'keyword', 'function', 'punctuation', 'number'],
  },
  typescript: {
    regex: /(\/\/.*|\/\*[\s\S]*?\*\/)|(["'`].*?["'`])|\b(const|let|var|function|return|if|else|import|export|from|async|await|new|this|class|interface|type|enum|implements|declare|namespace)\b|([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()|(\{|\}|\(|\)|\[|\])|([0-9]+)/g,
    types: ['comment', 'string', 'keyword', 'function', 'punctuation', 'number'],
  },
  react: { // TSX/JSX
    regex: /(\/\/.*|\/\*[\s\S]*?\*\/)|(["'`].*?["'`])|\b(const|let|var|function|return|if|else|import|export|from|async|await|new|this|class|interface|type)\b|(<\/?[A-Z][a-zA-Z0-9]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()|(\{|\}|\(|\)|\[|\])|([0-9]+)/g,
    types: ['comment', 'string', 'keyword', 'tag', 'function', 'punctuation', 'number'],
  },
  vue: { 
    regex: /(<!--[\s\S]*?-->)|(<\/?[a-z0-9\-]+)|(>)|(="[^"]*")|("[^"]*")|([a-z\-]+)=|\b(v-if|v-for|v-model|@click)\b/gi,
    types: ['comment', 'tag', 'bracket', 'attr-value', 'string', 'attr-name', 'keyword'],
  },
  java: {
    regex: /(\/\/.*|\/\*[\s\S]*?\*\/)|(["'`].*?["'`])|\b(public|private|protected|class|void|static|final|int|float|double|boolean|String|return|if|else|new|this|extends|implements|import|package)\b|(@[a-zA-Z]+)|([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()|(\{|\}|\(|\)|\[|\]|;)/g,
    types: ['comment', 'string', 'keyword', 'annotation', 'function', 'punctuation'],
  },
  json: {
    regex: /(".*?")(?=:)|(".*?")|(\{|\}|\[|\]|:|,)|(\b\d+\b|true|false|null)/g,
    types: ['keyword', 'string', 'punctuation', 'number'],
  },
  yaml: {
    regex: /(#.*)|([a-z0-9_\-]+)(?=:)|(:)|(-)|(".*?")/gi,
    types: ['comment', 'keyword', 'punctuation', 'punctuation', 'string'],
  },
  markdown: {
    regex: /(#+ .*)|(\*\*.*?\*\*)|(\*.*?\*)|(`{3}[\s\S]*?`{3})|(`.*?`)|(\[.*?\]\(.*?\))|(- )/g,
    types: ['keyword', 'string', 'italic', 'comment', 'function', 'link', 'punctuation'],
  },
  xml: {
    regex: /(<!--[\s\S]*?-->)|(<\/?[a-z0-9]+)|(>)|(="[^"]*")|("[^"]*")|([a-z\-]+)=/gi,
    types: ['comment', 'tag', 'bracket', 'attr-value', 'string', 'attr-name'],
  },
  properties: { // Properties and Conf
    regex: /(#.*)|([a-zA-Z0-9_\-\.]+)(?==)|(=)|(.*)/g,
    types: ['comment', 'keyword', 'punctuation', 'string'],
  },
  sql: {
    regex: /(--.*)|(["'`].*?["'`])|\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|BY|ORDER|LIMIT|CREATE|TABLE|PRIMARY|KEY|VALUES|SET|AND|OR|NOT|NULL)\b|([0-9]+)|(\*|;|,|\(|\))/gi,
    types: ['comment', 'string', 'keyword', 'number', 'punctuation'],
  },
  python: {
    regex: /(#.*)|(["'`]{3}[\s\S]*?["'`]{3}|["'].*?["'])|\b(def|class|if|else|elif|for|while|import|from|return|print|try|except|with|as|pass|True|False|None)\b|([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()|([0-9]+)/g,
    types: ['comment', 'string', 'keyword', 'function', 'number'],
  },
  log: {
    regex: /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})|(\bINFO\b)|(\bWARN\b)|(\bERROR\b)|(\bDEBUG\b)|(\[.*?\])/g,
    types: ['number', 'function', 'keyword', 'string', 'comment', 'annotation'],
  }
};

const tokenize = (code: string, language: string): Token[] => {
  const lang = LANGUAGES[language] || LANGUAGES['javascript']; // Fallback
  let lastIndex = 0;
  const tokens: Token[] = [];
  
  // Use replace as an iterator
  code.replace(lang.regex, (match, ...args) => {
    const offset = args[args.length - 2];
    
    // Push simple text before match
    if (offset > lastIndex) {
      tokens.push({ type: 'text', content: code.slice(lastIndex, offset) });
    }
    
    // Determine token type based on which capturing group matched
    let type = 'text';
    for (let i = 0; i < lang.types.length; i++) {
        if (args[i] !== undefined) {
            type = lang.types[i];
            break;
        }
    }
    
    tokens.push({ type, content: match });
    lastIndex = offset + match.length;
    return match;
  });

  // Push remaining text
  if (lastIndex < code.length) {
    tokens.push({ type: 'text', content: code.slice(lastIndex) });
  }

  return tokens;
};

interface SyntaxHighlighterProps {
  code: string;
  language: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
  const tokens = tokenize(code, language);

  const getColor = (type: string) => {
      // Colors optimized for both Light (default) and Dark modes
      switch (type) {
          case 'comment': return 'text-gray-400 dark:text-gray-500 italic';
          case 'string': return 'text-green-600 dark:text-green-400';
          case 'keyword': return 'text-purple-600 dark:text-purple-400 font-bold';
          case 'function': return 'text-blue-600 dark:text-blue-400';
          case 'number': return 'text-orange-600 dark:text-orange-400';
          case 'tag': return 'text-blue-700 dark:text-blue-300 font-bold';
          case 'attr-name': return 'text-sky-600 dark:text-sky-300';
          case 'attr-value': return 'text-orange-600 dark:text-orange-300';
          case 'selector': return 'text-amber-600 dark:text-amber-400';
          case 'property': return 'text-cyan-700 dark:text-cyan-300';
          case 'annotation': return 'text-yellow-600 dark:text-yellow-400';
          case 'italic': return 'italic text-gray-600 dark:text-gray-400';
          case 'link': return 'text-blue-500 underline';
          default: return 'text-gray-800 dark:text-gray-300';
      }
  };

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={getColor(token.type)}>{token.content}</span>
      ))}
    </>
  );
};
