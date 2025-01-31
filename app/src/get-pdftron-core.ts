import { Core } from "@pdftron/webviewer";

export const getPDFTronCore = (): typeof Core => {
  // eslint-disable-next-line no-prototype-builtins
  if (!window.hasOwnProperty("Core")) {
    throw new Error("PDFTron Core not available in window object");
  }

  return (window as any).Core;
};
