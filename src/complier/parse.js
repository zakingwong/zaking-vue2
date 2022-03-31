const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];
  let currentParent;
  let root;
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    if (!root) {
      // 是否是空树
      root = node; // 如果是root得话那么当前的节点就是根节点
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }

    stack.push(node);
    currentParent = node;
  }
  function chars(text) {
    text = text.replace(/\s/g, "");
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }
  function end() {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }

    return false;
  }
  while (html) {
    let textEnd = html.indexOf("<");
    // 如果textEnd是0，说明是一个开始标签或是一个结束标签
    // 如果textEnd大于0，说明就是文本的结束位置
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  return root;
}
