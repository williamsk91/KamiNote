import { ICheckBox } from "components/primitiveBlocks/Checkbox";
import { IHeader } from "components/primitiveBlocks/Header";
import { IList } from "components/primitiveBlocks/list";

/** all available block types */
export enum BlockTypes {
  Checkbox = "Checkbox",
  Header = "Header",
  List = "List"
}
interface IICheckBox {
  blockType: BlockTypes.Checkbox;
  data: ICheckBox;
}
interface IIHeader {
  blockType: BlockTypes.Header;
  data: IHeader;
}
interface IIList {
  blockType: BlockTypes.List;
  data: IList;
}
export type IBlock = IICheckBox | IIHeader | IIList;
