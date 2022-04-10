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
    // 开始要创建一个AST对象
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
  // 如果匹配到尾标签了，说明需要清楚栈中存储的对象，这样我们就完成了一个标签的匹配
  function end() {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    // 匹配标签的开始
    const start = html.match(startTagOpen);
    // 如果存在的话，就放到这样的一个对象里
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      // 需要删除掉匹配到的部分，匹配一部分就删除一部分
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      // 匹配属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
        // 去下空格，感觉这样不太好，但是功能达到了，嘻嘻
        match.attrs.forEach((item) => {
          item.name = item.name.replace(/\s+/g, "");
          item.value = item.value.replace(/\s+/g, "");
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
    if (textEnd === 0) {
      // 这个就是通过正则，来匹配目标字符串了
      const startTagMatch = parseStartTag();
      // 如果存在的话，那么跳过此次循环，获取到对应的标签名和属性
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      // 匹配尾部标签
      let endTagMatch = html.match(endTag);
      // 同样的
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    // 如果textEnd大于0，说明就是文本的结束位置
    // 匹配文本
    if (textEnd > 0) {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  console.log(root, "root");
  return root;
}
