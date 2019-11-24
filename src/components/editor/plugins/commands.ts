import { schema } from "../schema";
import { EditorState } from "prosemirror-state";

export const toggleTaskItem = (state: EditorState, dispatch) => {
  console.log("state: ", state);
  let { $from, $anchor } = state.selection;
  let parent = $from.node(-1);
  if (parent.type !== schema.nodes.taskItem) return false;
  if (dispatch) {
    // -2 comes from going up 2 levels taskItem - paragraph - text
    dispatch(
      state.tr
        .setNodeMarkup($anchor.pos - $anchor.parentOffset - 2, undefined, {
          "data-checked": !parent.attrs["data-checked"]
        })
        .scrollIntoView()
    );
  }
  return true;
};
