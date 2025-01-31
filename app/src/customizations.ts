import { Core } from "@pdftron/webviewer";
import { getPDFTronCore } from "./get-pdftron-core";
import Annotation = Core.Annotations.Annotation;

const focusClass = "form-field-focus";

/**
 * Customize the signature's SignHereElement.
 * @param signHereElement
 * @param innerText
 */
export const styleSignHereElement = (
  signHereElement: HTMLDivElement,
  innerText: string
) => {
  signHereElement.style.width = "100%";
  signHereElement.style.height = "100%";
  signHereElement.style.fontSize = "8px";
  signHereElement.style.display = "flex";
  signHereElement.style.justifyContent = "center";
  signHereElement.style.alignItems = "center";

  signHereElement.innerText = innerText;
};

/**
 * Customize the signature field to add a click event listener to the signature field.
 * @param callback
 */
export const customizeSignatureField = (
  callback: (annotation: Annotation) => void
) => {
  const pdfTronCore = getPDFTronCore();
  pdfTronCore.Annotations.setCustomCreateSignHereElementHandler(
    (signatureTool, { annotation }) => {
      const signHereElement = document.createElement("div");
      styleSignHereElement(
        signHereElement,
        annotation.getField().getValue().toString()
      );

      (signHereElement as HTMLDivElement).tabIndex = 0;
      (signHereElement as HTMLDivElement).style.outline = "none";
      signHereElement.addEventListener("click", () => {
        callback(annotation);
      });
      signHereElement.addEventListener("focus", () => {
        const parent =
          signHereElement.parentElement.parentElement.parentElement;
        (parent as HTMLDivElement).classList.add(focusClass);
      });
      signHereElement.addEventListener("blur", () => {
        const parent =
          signHereElement.parentElement.parentElement.parentElement;
        (parent as HTMLDivElement).classList.remove(focusClass);
      });
      signHereElement.addEventListener("keydown", (event: KeyboardEvent) => {
        switch (event.code) {
          case "Enter":
            event.preventDefault();
            event.stopPropagation();
            callback(annotation);
            break;
          case "Space":
            event.preventDefault();
            event.stopPropagation();
            callback(annotation);
            break;
          default:
            break;
        }
      });

      return signHereElement;
    }
  );
};
