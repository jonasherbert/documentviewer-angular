import { AfterViewInit, Component } from '@angular/core';
import { Core } from "@pdftron/webviewer";
import { ActionType, AnnotationProperties } from './models';

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
    
    this.customizeWidgetStyles();

    this.registerFormFieldCreationModeListeners();

    //IMPORTANT: For Webviewer v10.1.0 and above you need to provide a licenseKey or remove timestamp from localStorage
    this.documentViewer.loadDocument('/assets/pdftron_about.pdf').then(() => {
      console.log('document loaded');
      this.setToolMode(this.core.Tools.ToolNames.EDIT);
      
      const annotationProperties: AnnotationProperties = {
        description: "My first field",
        placeholder: "Hello World",
        fontSize: 8,
        mandatory: false,
        page: 1,
        x: 50,
        y: 350,
        width: 50,
        height: 20,
        id: "1234",
        type: ActionType.TEXT_FIELD,
      }
      
      this.createTextFieldAnnotation(annotationProperties);
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

  private customizeWidgetStyles() {
    this.core.Annotations.WidgetAnnotation["getCustomStyles"] = widget => {
      if (widget instanceof this.core.Annotations.TextWidgetAnnotation) {
        // can check widget properties
        if (widget.fieldName === 'f1-1') {
          return {
            'background-color': 'lightgreen'
          };
        }
        return {
          'background-color': 'lightblue',
          color: 'brown'
        };
      }
    };
  }

  private createTextFieldAnnotation(field: AnnotationProperties) {
    const flags = new this.core.Annotations.WidgetFlags();
    flags.set(this.core.Annotations.WidgetFlags.MULTILINE, true);
    flags.set(this.core.Annotations.WidgetFlags.DO_NOT_SCROLL, true);
    flags.set(this.core.Annotations.WidgetFlags.REQUIRED, field.mandatory);
    flags.set(this.core.Annotations.WidgetFlags.RICH_TEXT, true);

    const textField = new this.core.Annotations.Forms.Field(field.description, {
      type: "Tx",
      value: field.placeholder,
      font: new this.core.Annotations.Font({ name: "Roboto", size: field.fontSize }),
      flags,
    });

    const widgetAnnotation = new this.core.Annotations.TextWidgetAnnotation(textField, null);
    widgetAnnotation.PageNumber = field.page;
    widgetAnnotation.X = field.x;
    widgetAnnotation.Y = field.y;
    widgetAnnotation.Width = field.width;
    widgetAnnotation.Height = field.height;
    widgetAnnotation.Id = field.id;
    widgetAnnotation.ToolName = "TextFormFieldCreateTool";

    const annotationManager = this.documentViewer.getAnnotationManager();
    annotationManager.getFieldManager().addField(textField);
    annotationManager.addAnnotation(widgetAnnotation);
    annotationManager.drawAnnotationsFromList([widgetAnnotation]);
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
