import React, { useEffect, useRef, FC, useMemo } from "react";
import styled from "styled-components";

import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
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
import { link, linkTooltip } from "./blocks/link";
import { tooltipPlugin } from "./plugins/tooltip";
import { inlineToolbar } from "./component/inlineToolbar";

export interface IEditor {
  /** Json string */
  initState?: string;

  /**
   * Callback every time state changes
   */
  onChange: (state: EditorState) => void;
}

export const Editor: FC<IEditor> = props => {
  const { initState, onChange } = props;

  const ref = useRef<HTMLDivElement>(null);
  let view: EditorView | null;

  const stateConfig = useMemo(
    () => ({
      schema,
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

        tooltipPlugin([linkTooltip, inlineToolbar]),

        placeholderPlugin()
      ]
    }),
    []
  );

  let state: EditorState;
  if (initState) {
    // check for invalid initState
    try {
      state = EditorState.fromJSON(stateConfig, JSON.parse(initState));
    } catch (err) {
      state = EditorState.create(stateConfig);
    }
  } else {
    state = EditorState.create(stateConfig);
  }

  const dispatchTransaction = (tr: Transaction) => {
    state = state.apply(tr);
    view && view.updateState(state);

    tr.docChanged && onChange(state);
  };

  useEffect(() => {
    if (ref.current) {
      view = new EditorView(ref.current, {
        state,
        nodeViews: buildViews([taskList]),
        dispatchTransaction
      });

      applyDevTools(view);
    }
  }, []);

  return (
    <Container>
      <EditorContainer id="editor" ref={ref} />
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
        <h1>H1</h1>
        <h2>H2</h2>
        <h3>H3</h3>
        <hr />
        <p>text</p>
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
        <p>
          Hello{" "}
          <span className="color" color="red">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="orange">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="yellow">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="green">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="blue">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="purple">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="color" color="pink">
            colored
          </span>{" "}
          text
        </p>
        <hr />
        <p>
          Hello{" "}
          <span className="highlight" color="red">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="orange">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="yellow">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="green">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="blue">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="purple">
            colored
          </span>{" "}
          text
        </p>
        <p>
          Hello{" "}
          <span className="highlight" color="pink">
            colored
          </span>{" "}
          text
        </p>
        <hr />
        <hr />
        <blockquote>Quote</blockquote>
        <pre>
          <code>codee</code>
          <code>export const foo = () => </code>
        </pre>
        <hr />
        <ul>item 1 </ul>
        <ul data-level={1}>item 1 </ul>
        <ul data-level={2}>item 1 </ul>
        <ol>item 1 </ol>
        <ol data-level={1}>item 1 </ol>
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
    </Container>
  );
};

/**
 * This is styled as opposed to the `EditorContainer`
 * to allows plugins like `tooltip` to position itself correctly.
 */
const Container = styled.div`
  position: relative;

  max-width: 720px;
  margin: auto;
  padding: 96px;
`;

const EditorContainer = styled.div`
  & :focus {
    outline: none;
  }

  ${editorStyles};
`;
