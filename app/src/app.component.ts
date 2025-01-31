import { AfterViewInit, Component } from "@angular/core";
import { Core } from "@pdftron/webviewer";
import { ActionType, AnnotationProperties } from "./models";
import { customizeSignatureField } from "./customizations";
import { getPDFTronCore } from "./get-pdftron-core";
import { uploadSignature } from "./file-upload";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
  private core!: typeof Core;

  protected isFormFieldCreationMode = false;

  protected documentViewer!: Core.DocumentViewer;

  protected editToolName;

  protected signFieldToolName;

  protected textFieldToolName;

  protected fields: Array<AnnotationProperties> = [
    {
      description: "My first field",
      placeholder: "Text",
      fontSize: 8,
      mandatory: true,
      page: 1,
      x: 0,
      y: 0,
      width: 230,
      height: 93,
      id: "1",
      type: ActionType.TEXT_FIELD,
      value: "",
    },
    {
      description: "My first field",
      placeholder: "Signatur",
      fontSize: 8,
      mandatory: true,
      page: 1,
      x: 297,
      y: 356,
      width: 100,
      height: 30,
      id: "2",
      type: ActionType.SIGNATURE_FIELD,
      value: "",
    },
  ];

  ngAfterViewInit() {
    this.core = getPDFTronCore();
    this.core.setWorkerPath("assets/pdftron");
    this.core.enableFullPDF();
    this.core.disableEmbeddedJavaScript();

    this.documentViewer = new this.core.DocumentViewer();
    this.documentViewer.setScrollViewElement(
      document.getElementById("scroll-view")!
    );
    this.documentViewer.setViewerElement(document.getElementById("viewer")!);
    this.documentViewer.enableAnnotations();

    // ToolNames enum can't be imported from the Core module, so we have to define them manually after the Core module is loaded.
    this.editToolName = this.core.Tools.ToolNames.EDIT;
    this.signFieldToolName = this.core.Tools.ToolNames.SIG_FORM_FIELD;
    this.textFieldToolName = this.core.Tools.ToolNames.TEXT_FORM_FIELD;

    this._registerFormFieldCreationModeListeners();

    //IMPORTANT: For Webviewer v10.1.0 and above you need to provide a licenseKey or remove timestamp from localStorage
    this.documentViewer.loadDocument("/assets/pdftron_about.pdf").then(() => {
      console.log("document loaded");
      this.setToolMode(this.core.Tools.ToolNames.EDIT);
      customizeSignatureField((annotation) => {
        console.log("Signature field clicked", annotation);
      });

      const annotations: Array<AnnotationProperties> = [
        {
          description: "My first field",
          placeholder: "Hello World",
          fontSize: 8,
          page: 1,
          x: 50,
          y: 350,
          width: 50,
          height: 20,
          id: "1",
          type: ActionType.TEXT_FIELD,
        },
        {
          description: "My first field",
          page: 1,
          x: 100,
          y: 550,
          width: 100,
          height: 40,
          id: "2",
          type: ActionType.SIGNATURE_FIELD,
        },
      ];

      annotations.forEach((annotation) => {
        this._createFormFieldAnnotation(annotation);
      });
    });
  }

  protected onFormFieldCreationModeChange(event: Event) {
    this.isFormFieldCreationMode = (event.target as HTMLInputElement).checked;

    if (this.isFormFieldCreationMode) {
      this.documentViewer
        .getAnnotationManager()
        .getFormFieldCreationManager()
        .startFormFieldCreationMode();
    } else {
      this.documentViewer
        .getAnnotationManager()
        .getFormFieldCreationManager()
        .endFormFieldCreationMode();
    }
  }

  protected setToolMode(toolName: Core.Tools.ToolNames) {
    this.documentViewer.setToolMode(this.documentViewer.getTool(toolName));
  }

  protected zoomIn() {
    let zoom = this.documentViewer.getZoomLevel();
    zoom += 0.1;
    this.documentViewer.zoomTo(zoom);
  }

  protected zoomOut() {
    let zoom = this.documentViewer.getZoomLevel();
    zoom -= 0.1;
    this.documentViewer.zoomTo(zoom);
  }

  protected async signSignatureFormField(id: string) {
    const annotationManager = this.documentViewer.getAnnotationManager();
    const formField = annotationManager.getAnnotationById(
      id
    ) as Core.Annotations.SignatureWidgetAnnotation;

    if (!formField) {
      throw new Error("Signature field not found");
    }

    // Upload signature image and convert it to base64
    const signature = await uploadSignature();

    if (!signature) {
      return;
    }

    // Create a signature stamp annotation
    const stampAnnot = new this.core.Annotations.StampAnnotation();
    stampAnnot.setHeight(signature.height);
    stampAnnot.setWidth(signature.width);
    stampAnnot.setPageNumber(formField.PageNumber);
    stampAnnot.Id = "image" + formField.Id;
    stampAnnot.setX(formField.getX());
    stampAnnot.setY(formField.getY());
    await stampAnnot.setImageData(signature.data);

    // Clear the form field and delete the associated signature annotation if the field is already filled
    if (formField.getAssociatedSignatureAnnotation()) {
      const associatedSignature = formField.getAssociatedSignatureAnnotation();
      formField.clearSignature(annotationManager);
      associatedSignature.ReadOnly = false;
      annotationManager.deleteAnnotation(associatedSignature);
    }

    // Draw the signature stamp annotation after clearing the form field
    annotationManager.addAnnotation(stampAnnot);
    annotationManager.redrawAnnotation(stampAnnot);

    // Since @pdftron/webviewer 11.0.0, the SignatureCreateTool replaces the
    // Widget annotation with the signature stamp annotation by default.
    // Thus, we need to override the signing mode to keep the Widget annotation.
    const tool = this.documentViewer.getTool(
      "AnnotationCreateSignature"
    ) as Core.Tools.SignatureCreateTool;
    tool.setSigningMode(
      this.core.Tools.SignatureCreateTool.SigningModes.ANNOTATION
    );

    (formField as Core.Annotations.SignatureWidgetAnnotation).sign(stampAnnot);
  }

  private _createFormFieldAnnotation(
    annotationProperties: AnnotationProperties
  ) {
    const flags = new this.core.Annotations.WidgetFlags();
    flags.set(this.core.Annotations.WidgetFlags.MULTILINE, true);
    flags.set(this.core.Annotations.WidgetFlags.DO_NOT_SCROLL, true);
    const randomId = this._getRandomId();

    const formField = new this.core.Annotations.Forms.Field(randomId, {
      type: annotationProperties.type === ActionType.TEXT_FIELD ? "Tx" : "Sig",
      value:
        annotationProperties.placeholder ??
        annotationProperties.description ??
        "123",
      font: new this.core.Annotations.Font({
        name: "Roboto",
        size: annotationProperties.fontSize,
      }),
      flags,
    });

    let widgetAnnotation: Core.Annotations.WidgetAnnotation, toolName: string;
    if (annotationProperties.type === ActionType.TEXT_FIELD) {
      formField.maxLen = 64;
      widgetAnnotation = new this.core.Annotations.TextWidgetAnnotation(
        formField,
        null
      );
      toolName = this.core.Tools.ToolNames.TEXT_FORM_FIELD.toString();
    } else {
      widgetAnnotation = new this.core.Annotations.SignatureWidgetAnnotation(
        formField,
        null
      );
      toolName = this.core.Tools.ToolNames.SIG_FORM_FIELD.toString();
    }

    const annotationColor = { r: 0, g: 104, b: 116 };

    widgetAnnotation.PageNumber = annotationProperties.page;
    widgetAnnotation.X = annotationProperties.x;
    widgetAnnotation.Y = annotationProperties.y;
    widgetAnnotation.Width = annotationProperties.width;
    widgetAnnotation.Height = annotationProperties.height;
    widgetAnnotation.Id = annotationProperties.id;
    widgetAnnotation.ToolName = toolName;
    widgetAnnotation.backgroundColor = new this.core.Annotations.Color(
      annotationColor.r,
      annotationColor.g,
      annotationColor.b,
      0.2
    );
    widgetAnnotation.border = new this.core.Annotations.Border({
      color: new this.core.Annotations.Color(
        annotationColor.r,
        annotationColor.g,
        annotationColor.b,
        1
      ),
      width: 1,
    });

    const annotationManager = this.documentViewer.getAnnotationManager();
    annotationManager.getFieldManager().addField(formField);
    annotationManager.addAnnotation(widgetAnnotation);
  }

  private _registerFormFieldCreationModeListeners() {
    this.documentViewer
      .getAnnotationManager()
      .getFormFieldCreationManager()
      .addEventListener("formFieldCreationModeStarted", (event, action) => {
        this.isFormFieldCreationMode = true;
      });

    this.documentViewer
      .getAnnotationManager()
      .getFormFieldCreationManager()
      .addEventListener("formFieldCreationModeEnded", (event, action) => {
        this.isFormFieldCreationMode = false;
        this.setToolMode(this.editToolName);
      });
  }

  private _getRandomId() {
    const randomInt = Math.floor(Math.random() * (100000 - 10000) + 10000);

    return `${Date.now()}_${randomInt}`;
  }
}
