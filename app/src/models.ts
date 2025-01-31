import { Core } from "@pdftron/webviewer";

export type AnnotationProperties = {
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  page?: number;
  description?: string;
  placeholder?: string;
  fontSize?: number;
  mandatory?: boolean;
  value?: string;
  type: ActionType;
  id: string;
};

export enum ActionType {
  SIGNATURE_FIELD = "signatureField",
  TEXT_FIELD = "textField",
}

export type FieldWidgetPair = {
  fields: Array<Core.Annotations.Forms.Field>;
  widgets: Array<Core.Annotations.TextWidgetAnnotation>;
};

export type Signature = {
  data: string;
  width: number;
  height: number;
};
