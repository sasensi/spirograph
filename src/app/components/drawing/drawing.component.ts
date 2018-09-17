import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as paper from 'paper';

@Component({
    selector: 'app-drawing',
    template: `
        <canvas #canvas></canvas>`,
    styles  : [],
})
export class DrawingComponent implements AfterViewInit
{
    @ViewChild('canvas') canvas: ElementRef;

    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private lastPoint1: paper.Point;
    private lastPoint2: paper.Point;
    private lastPoint3: paper.Point;

    ngAfterViewInit ()
    {
        this.canvasElement = this.canvas.nativeElement as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d');
        this.resize();
    }

    drawNextPoint ( point: paper.Point )
    {
        if (this.lastPoint3 && this.lastPoint2)
        {
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(this.lastPoint3.x, this.lastPoint3.y);
            this.canvasContext.lineTo(this.lastPoint2.x, this.lastPoint2.y);
            this.canvasContext.stroke();
        }
        this.lastPoint3 = this.lastPoint2;
        this.lastPoint2 = this.lastPoint1;
        this.lastPoint1 = point;
    }

    clear ()
    {
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.lastPoint1 = null;
        this.lastPoint2 = null;
        this.lastPoint3 = null;
    }

    resize ()
    {
        this.canvasElement.width  = paper.view.bounds.width;
        this.canvasElement.height = paper.view.bounds.height;
    }
}
