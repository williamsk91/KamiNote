import React, { useEffect } from "react";
import styled from "styled-components";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { undo, redo, history } from "prosemirror-history";
import { dropCursor } from "prosemirror-dropcursor";

import applyDevTools from "prosemirror-dev-tools";

import { schema } from "./schema";
import { editorStyles } from "./styles";
import { buildViews, buildBlockPlugins } from "./blocks/utils";
import { taskList } from "./blocks/taskList";
import { list } from "./blocks/list";
import { marks } from "./blocks/marks";
import { placeholderPlugin } from "./plugins/placeholder";
import { heading, hr, blockQuote, codeBlock } from "./blocks/base";
import { buildTooltipPlugin } from "./plugins/tooltip";
import { link, LinkTooltip } from "./blocks/link";
import { inlineToolbar } from "./plugins/inlineToolbar";
import { suggestionPlugin } from "./plugins/suggestion/suggestion";
import { suggestionPluginStyles } from "./plugins/suggestion/inlineDeco";

export const Editor = () => {
  let view: EditorView | null;
  useEffect(() => {
    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(
        document.querySelector("#content") as Node
      ),
      plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        dropCursor(),

        ...buildBlockPlugins([
          taskList,
          list,
          marks,
          heading,
          hr,
          blockQuote,
          codeBlock,
          link
        ]),

        ...buildTooltipPlugin("tooltipParent", [LinkTooltip]),
        inlineToolbar("toolbar"),

        placeholderPlugin(),

        suggestionPlugin("wss://suggestion-next.cadmus.io")
      ]
    });

    view = new EditorView(document.querySelector("#editor") as Node, {
      state,
      nodeViews: buildViews([taskList])
    });

    applyDevTools(view);
  }, []);

  return (
    <>
      <Container onClick={() => view && view.focus()} id="editor" />
      <div id="content" style={{ display: "none" }}>
        <p>
          hmmmm{" "}
          <a href="https://evernote.com/">
            note link <b>wow</b> amazing
          </a>
          <a href="https://google.com/">different link</a>
          normal
          <b>boooold</b> weeeee
        </p>
        <p>[name](hieo)</p>
        <p>https://evernote.com/</p>
        <hr />
        <h1>H1 wrd</h1>
        <h2>H2 sdfdgsdfgsdf</h2>
        <h3>H3 wrd</h3>
        <p>simple txt with sme words</p>
        <p>this paagrph misspelled wrd</p>
        <p>ths one too wrd teehee wrd</p>
        <p>
          <b>bold</b> && <i>italic</i> && <s>strike</s>
        </p>
        <p>
          <span data-color="yellow">yellow text</span>
        </p>
        <p>
          also <code>code</code>
        </p>
        <hr />
        <hr />
        <hr />
        <blockquote>Quote</blockquote>
        <pre>
          <code>codee</code>
          <code>export const foo = () => </code>
        </pre>
        <hr />
        <ul>item 1 </ul>
        <ul data-level={1}>item 1 wrd</ul>
        <ul data-level={2}>item wrd 1 </ul>
        <ol>item 1 </ol>
        <ol data-level={1}>item sdgfg 1 </ol>
        <ol data-level={2}>item 1 </ol>
        <div className="taskList" data-checked={true}>
          checked
        </div>
        <div className="taskList" data-level={1} data-checked={false}>
          unchecked
        </div>
        <div className="taskList" data-level={2} data-checked={true}>
          checked
        </div>
        <hr />
      </div>
      {/* This is used to render tooltips */}
      <div id="tooltipParent" />
      <div id="toolbar" />
    </>
  );
};

const Container = styled.div`
  position: relative;

  max-width: 720px;
  margin: auto;
  padding: 96px;

  & :focus {
    outline: none;
  }

  ${editorStyles};
  ${suggestionPluginStyles}
`;
