import { AfterViewInit, Component } from '@angular/core';
import { Core } from "@pdftron/webviewer";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  private core!: typeof Core;

  protected isFormFieldCreationMode = false;

  protected documentViewer!: Core.DocumentViewer;

  protected editToolName;
  
  protected signFieldToolName;

  protected textFieldToolName;

  ngAfterViewInit() {
    this.core = this.getPDFTronCore();
    this.core.setWorkerPath("assets/pdftron");
    this.core.enableFullPDF();
    this.core.disableEmbeddedJavaScript();


    this.documentViewer = new this.core.DocumentViewer();
    this.documentViewer.setScrollViewElement(document.getElementById("scroll-view")!);
    this.documentViewer.setViewerElement(document.getElementById("viewer")!);
    this.documentViewer.enableAnnotations();

    // ToolNames enum can't be imported from the Core module, so we have to define them manually after the Core module is loaded.
    this.editToolName = this.core.Tools.ToolNames.EDIT;
    this.signFieldToolName = this.core.Tools.ToolNames.SIG_FORM_FIELD;
    this.textFieldToolName = this.core.Tools.ToolNames.TEXT_FORM_FIELD;

    this.customizeTools();
    this.customizeSignatureField();

    this.registerFormFieldCreationModeListeners();

    //IMPORTANT: For Webviewer v10.1.0 and above you need to provide a licenseKey or remove timestamp from localStorage
    this.documentViewer.loadDocument('/assets/pdftron_about.pdf').then(() => {
      console.log('document loaded');
      this.setToolMode(this.core.Tools.ToolNames.EDIT);
    });
  }

  protected onFormFieldCreationModeChange(event: Event) {
    this.isFormFieldCreationMode = (event.target as HTMLInputElement).checked;

    if (this.isFormFieldCreationMode) {
      this.documentViewer.getAnnotationManager().getFormFieldCreationManager().startFormFieldCreationMode();
    } else {
      this.documentViewer.getAnnotationManager().getFormFieldCreationManager().endFormFieldCreationMode();
    }
  }

  protected setToolMode(toolName: Core.Tools.ToolNames) {
    this.documentViewer.setToolMode(this.documentViewer.getTool(toolName));
  }

  private getPDFTronCore(): typeof Core {
    if (!window.hasOwnProperty("Core")) {
      throw new Error("PDFTron Core not available in window object");
    }
    return (window as any).Core;
  }

  private customizeTools() {
    const FormFieldToolStyle = {
      "StrokeColor": new this.core.Annotations.Color(0, 104, 116, 1),
      "FillColor": new this.core.Annotations.Color(0, 104, 116, 0.2),
      "StrokeThickness": 2,
    };

    this.documentViewer.getTool(this.core.Tools.ToolNames.TEXT_FORM_FIELD).setStyles(FormFieldToolStyle);
    this.documentViewer.getTool(this.core.Tools.ToolNames.SIG_FORM_FIELD).setStyles(FormFieldToolStyle);
  }

  private customizeSignatureField() {
    this.core.Annotations.setCustomCreateSignHereElementHandler((signatureTool, { annotation }) => {
      const signHereElement = document.createElement("div");
      signHereElement.style.width = "100%";
      signHereElement.style.height = "100%";
      signHereElement.style.backgroundColor = "rgba(0, 104, 116, 0.2)";
      signHereElement.style.border = "2px solid rgba(0, 104, 116, 1)";
      signHereElement.style.cursor = "pointer";

      return signHereElement;
    });
  }

  private registerFormFieldCreationModeListeners() {
    this.documentViewer.getAnnotationManager().getFormFieldCreationManager().addEventListener('formFieldCreationModeStarted', (event, action) => {
        this.isFormFieldCreationMode = true;
    });

    this.documentViewer.getAnnotationManager().getFormFieldCreationManager().addEventListener('formFieldCreationModeEnded', (event, action) => {
        this.isFormFieldCreationMode = false;
        this.setToolMode(this.editToolName);
    });
  }
}
