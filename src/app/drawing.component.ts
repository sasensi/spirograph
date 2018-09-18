import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as paper from 'paper';

/**
 * Handle main drawing.
 *
 * Drawing is rendered in a different canvas than PaperJS one for better performances.
 * Storing full path informations quickly make browser slower and doesn't have any interest for this application.
 * So instead, on each new frame, a new line is just drawn over existing canvas.
 * Thanks to this, animation loop can run indefinitely without impacting browser performance.
 */
@Component({
    selector: 'app-drawing',
    template: `<canvas #canvas></canvas>`,
    styles  : [],
})
export class DrawingComponent implements AfterViewInit
{
    // get a reference to the HTML canvas element
    @ViewChild('canvas') canvas: ElementRef;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;

    // 3 lasts points are stored to be able to do a delay effect.
    // Native canvas being rendered faster than PaperJS one,
    // we render native canvas one frame after PaperJS one
    // so that drawer's drawing point is never behind last drawn point.
    private lastPoint1: paper.Point;
    private lastPoint2: paper.Point;
    private lastPoint3: paper.Point;

    // on view loaded
    ngAfterViewInit ()
    {
        // store canvas references
        this.canvasElement = this.canvas.nativeElement as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d');
        this.resize();
    }

    /**
     * Draw a line between given point and last stored one with one frame delay.
     * @param point
     */
    drawNextPoint ( point: paper.Point )
    {
        // only draw if 3 points are stored
        if (this.lastPoint3 && this.lastPoint2)
        {
            // draw a line between 2 oldest stored points
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(this.lastPoint3.x, this.lastPoint3.y);
            this.canvasContext.lineTo(this.lastPoint2.x, this.lastPoint2.y);
            this.canvasContext.stroke();
        }
        // store points
        this.lastPoint3 = this.lastPoint2;
        this.lastPoint2 = this.lastPoint1;
        this.lastPoint1 = point;
    }

    /**
     * Clear drawing.
     */
    clear ()
    {
        // clear canvas
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // clear stored points
        this.lastPoint1 = null;
        this.lastPoint2 = null;
        this.lastPoint3 = null;
    }

    /**
     * Adapt canvas size to window.
     */
    resize ()
    {
        this.canvasElement.width  = paper.view.bounds.width;
        this.canvasElement.height = paper.view.bounds.height;
    }
}
