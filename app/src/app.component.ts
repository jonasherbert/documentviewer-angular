import { AfterViewInit, Component } from '@angular/core';
import { Core } from "@pdftron/webviewer";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit() {
    const Core = this.getPDFTronCore();
    Core.setWorkerPath("assets/pdftron");
    Core.enableFullPDF();

    const documentViewer = new Core.DocumentViewer();
    documentViewer.setScrollViewElement(document.getElementById("scroll-view")!);
    documentViewer.setViewerElement(document.getElementById("viewer")!);
    documentViewer.enableAnnotations();
    documentViewer.getDisplayModeManager().disableVirtualDisplayMode();

    documentViewer.loadDocument('/assets/pdftron_about.pdf', {licenseKey: __PDFTRON_LICENSE_KEY__ }).then(() => {
      console.log('document loaded');
      documentViewer.setToolMode(documentViewer.getTool(Core.Tools.ToolNames.EDIT));
    });
  }

  getPDFTronCore(): typeof Core {
    if (!window.hasOwnProperty("Core")) {
      throw new Error("PDFTron Core not available in window object");
    }
    return (window as any).Core;
  }
}
