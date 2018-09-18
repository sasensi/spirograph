import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as paper from 'paper';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

/**
 * Drawer component that handle and displays drawing construction logic.
 * Relies on PaperJS for geometry calculations.
 */
@Component({
    selector: 'app-drawer',
    template: `<canvas #canvas resize="true"></canvas>`,
    styles  : [],
})
export class DrawerComponent implements AfterViewInit
{
    // get a reference to the HTML canvas element
    @ViewChild('canvas') canvas: ElementRef;

    // handle radius and position setting
    @Input() set radius ( value: number )
    {
        // don't do nothing if value is empty
        if (!value)
        {
            return;
        }
        // normalize value
        this.innerRadiusFactor = value / 100;
        this.reset();
    }

    @Input() set position ( value: number )
    {
        // don't do nothing if value is empty
        if (!value)
        {
            return;
        }
        // normalize value
        this.drawingPointPositionFactor = value / 100;
        this.reset();
    }

    // flag to prevent drawing before setup
    private ready = false;

    // PaperJS elements references
    private outerCircle: paper.Path.Circle;
    private innerCircle: paper.Path.Circle;
    private drawingPoint: paper.Path.Circle;
    private innerCircleGroup: paper.Group;
    private initialVector: paper.Point;

    // state variables
    private framesCounter: number;
    private innerRadiusFactor: number;
    private drawingPointPositionFactor: number;

    // on view loaded
    ngAfterViewInit ()
    {
        // setup PaperJS
        paper.setup(this.canvas.nativeElement);

        // mark component as ready
        this.ready = true;

        // draw
        this.reset();
    }

    /**
     * Clear existing elements.
     * Draw new elements at initial position.
     */
    reset ()
    {
        // check needed values are set
        if (!this.ready || !this.innerRadiusFactor || !this.drawingPointPositionFactor)
        {
            return;
        }

        // clear previous elements
        paper.project.clear();

        // reset state
        this.framesCounter = 0;

        // calculate drawing constants
        const minWindowSide = Math.min(paper.view.bounds.height, paper.view.bounds.width);
        const outerRadius   = minWindowSide * .4;

        // draw elements
        this.outerCircle  = new paper.Path.Circle(paper.view.center, outerRadius);
        this.innerCircle  = new paper.Path.Circle(paper.view.center, outerRadius * this.innerRadiusFactor);
        this.drawingPoint = this.loadDrawingPoint();
        const radius    = new paper.Path.Line(this.innerCircle.bounds.center, this.innerCircle.bounds.topCenter);

        // group inner circle elements to be able to move and rotate them together
        this.innerCircleGroup = new paper.Group([ this.innerCircle, radius, this.drawingPoint ]);
        // place inner circle so that both circle overlaps on top
        this.innerCircleGroup.translate(this.outerCircle.bounds.topCenter.subtract(this.innerCircle.bounds.topCenter));
        // make sure matrix is not applied to child elements
        // this allow easier rotation handling
        this.innerCircleGroup.applyMatrix = false;

        // style elements
        paper.project.activeLayer.children.forEach(child =>
        {
            child.strokeColor = 'lightgrey';
        });
        this.drawingPoint.fillColor = 'black';

        // store start vector to facilitate calculations
        this.initialVector = this.innerCircle.bounds.center.subtract(this.outerCircle.bounds.center);
    }

    /**
     * Updates drawer position simulating inner circle movement along outer circle perimeter.
     * Returns the new drawing point.
     */
    getNextPoint (): paper.Point
    {
        // increment angles
        this.framesCounter++;
        const angle         = this.framesCounter;
        const vector        = this.initialVector.rotate(angle);
        const rotationAngle = -angle * (1 / (this.innerRadiusFactor * 2));

        // calculate inner circle position
        const position = this.outerCircle.bounds.center.add(vector);

        // update inner circle position and rotation
        this.innerCircleGroup.position = position;
        this.innerCircleGroup.rotation = rotationAngle;

        // get drawing point position
        return this.innerCircleGroup.matrix.transform(this.drawingPoint.bounds.center);
    }

    private loadDrawingPoint (): paper.Path.Circle
    {
        let vector     = this.innerCircle.bounds.topCenter.subtract(this.innerCircle.bounds.center);
        vector         = vector.normalize(this.drawingPointPositionFactor * vector.length);
        const position = this.innerCircle.bounds.center.add(vector);
        return new paper.Path.Circle(position, 5);
    }
}
