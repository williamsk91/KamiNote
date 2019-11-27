import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { css } from "styled-components";

/**
 * Adds "p-empty-focus" class to empty AND focused (anchor) block nodes
 *
 * note: this only adds class to blocks and not style them.
 *       for some styling add "placeholderPluginStyles"
 */
export const placeholderPlugin = () =>
  new Plugin({
    props: {
      decorations: state => {
        const decorations: Decoration[] = [];

        const decorate = (node: Node, pos: number) => {
          if (
            node.type.isBlock &&
            // empty
            node.childCount === 0 &&
            // focus
            state.selection.$anchor.parent === node
          ) {
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: "p-empty-focus"
              })
            );
          }
        };

        state.doc.descendants(decorate);

        return DecorationSet.create(state.doc, decorations);
      }
    }
  });

/**
 * helper for 'placeholderPluginStyles'
 */
const placeholderPluginNodeContent = (tag: string, text: string) => css`
  ${tag}.p-empty-focus::before {
    content: "${text}";
  }
`;

export const placeholderPluginStyles = css`
  .p-empty-focus {
    ::before {
      position: absolute;
      color: #aaa;
      cursor: text;
    }
  }

  ${placeholderPluginNodeContent("p", "Insert some content")}

  ${placeholderPluginNodeContent("h1", "Heading 1")}
  ${placeholderPluginNodeContent("h2", "Heading 2")}
  ${placeholderPluginNodeContent("h3", "Heading 3")}

  ${placeholderPluginNodeContent("div.taskItem", "To-Do")}
  ${placeholderPluginNodeContent("li", "List")}

  ${placeholderPluginNodeContent("blockquote", "Empty Quote")}


`;
