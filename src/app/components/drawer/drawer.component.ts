import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as paper from 'paper';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

@Component({
    selector: 'app-drawer',
    template: `
        <canvas #canvas resize="true"></canvas>`,
    styles  : [],
})
export class DrawerComponent implements AfterViewInit
{
    @ViewChild('canvas') canvas: ElementRef;

    @Input() set radius ( value: number )
    {
        if (!value)
        {
            return;
        }
        this.innerRadiusFactor = value / 100;
        this.reset();
    }

    @Input() set position ( value: number )
    {
        if (!value)
        {
            return;
        }
        this.headPositionFactor = value / 100;
        this.reset();
    }

    private ready = false;
    private outerCircle: paper.Path.Circle;
    private innerCircle: paper.Path.Circle;
    private head: paper.Path.Circle;
    private innerCircleGroup: paper.Group;
    private initialVector: paper.Point;
    private framesCounter: number;
    private innerRadiusFactor: number;
    private headPositionFactor: number;

    ngAfterViewInit ()
    {
        paper.setup(this.canvas.nativeElement);

        this.ready = true;
        this.reset();
    }

    reset ()
    {
        if (!this.ready || !this.innerRadiusFactor || !this.headPositionFactor)
        {
            return;
        }

        paper.project.clear();
        this.framesCounter = 0;

        const minWindowSide = Math.min(paper.view.bounds.height, paper.view.bounds.width);
        const outerRadius   = minWindowSide * .4;

        this.outerCircle = new paper.Path.Circle(paper.view.center, outerRadius);
        this.innerCircle = new paper.Path.Circle(paper.view.center, outerRadius * this.innerRadiusFactor);
        const diameter   = new paper.Path.Line(this.innerCircle.bounds.bottomCenter, this.innerCircle.bounds.topCenter);

        let headVector     = this.innerCircle.bounds.topCenter.subtract(this.innerCircle.bounds.bottomCenter);
        headVector         = headVector.normalize(this.headPositionFactor * headVector.length);
        const headPosition = this.innerCircle.bounds.bottomCenter.add(headVector);
        this.head          = new paper.Path.Circle(headPosition, 5);

        this.innerCircleGroup = new paper.Group([ this.innerCircle, diameter, this.head ]);
        this.innerCircleGroup.translate(this.outerCircle.bounds.topCenter.subtract(this.innerCircle.bounds.topCenter));
        this.innerCircleGroup.applyMatrix = false;

        // style
        paper.project.activeLayer.children.forEach(child =>
        {
            child.strokeColor = 'lightgrey';
        });
        this.head.fillColor = 'black';

        this.initialVector = this.innerCircle.bounds.center.subtract(this.outerCircle.bounds.center);
    }

    getNextPoint (): paper.Point
    {
        this.framesCounter++;
        const angle         = this.framesCounter;
        const vector        = this.initialVector.rotate(this.framesCounter);
        const position      = this.outerCircle.bounds.center.add(vector);
        const rotationAngle = -angle * (1 / (this.innerRadiusFactor * 2));

        this.innerCircleGroup.position = position;
        this.innerCircleGroup.rotation = rotationAngle;
        return this.innerCircleGroup.matrix.transform(this.head.bounds.center);
    }
}
