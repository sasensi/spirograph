import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import * as paper from 'paper';
import { fromEvent, interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { scan } from 'rxjs/operators';
import { DrawerComponent } from './drawer.component';
import { DrawingComponent } from './drawing.component';

/**
 * Main app entrypoint component.
 * Creates and controls drawer and drawing components.
 * Also handles user interactions.
 */
@Component({
    selector: 'app-root',
    template: `
        <header *ngIf="infosVisibles">spirograph</header>
        
        <app-drawer [hidden]="!infosVisibles" [radius]="radius" [position]="position"></app-drawer>
        <app-drawing></app-drawing>
        
        <footer>
            <div *ngIf="infosVisibles">
                <mat-slider [(ngModel)]="radius" (input)="onRadiusSliderMoved($event)" (change)="restorePlayingStateOnSliderReleased($event)"></mat-slider>
                <mat-slider [(ngModel)]="position" (input)="onPositionSliderMoved($event)" (change)="restorePlayingStateOnSliderReleased($event)"></mat-slider>
            </div>
            <div>
                <button mat-icon-button (click)="shuffle()">
                    <mat-icon>shuffle</mat-icon>
                </button>
                <button mat-icon-button (click)="infosVisibles = !infosVisibles">
                    <mat-icon>{{infosVisibles ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <button mat-icon-button (click)="playing = !playing">
                    <mat-icon>{{playing ? 'pause' : 'play_arrow'}}</mat-icon>
                </button>
            </div>
        </footer>
        <aside *ngIf="infosVisibles">
            <a href="http://www.samuelasensi.com" target="_blank">Samuel ASENSI</a> (<a href="https://github.com/sasensi/spirograph" target="_blank">code</a>)
        </aside>
    `,
    styles  : [],
})
export class AppComponent implements AfterViewInit
{
    // references to child components
    @ViewChild(DrawerComponent) drawer: DrawerComponent;
    @ViewChild(DrawingComponent) drawing: DrawingComponent;

    // state variables
    playing                        = false;
    radius: number                 = 33;
    position: number               = 33;
    infosVisibles                  = true;
    wasPlayingBeforeSlidingStarted = false;

    // on view loaded
    ngAfterViewInit ()
    {
        // on each frame
        interval(0, animationFrame).subscribe(() =>
        {
            // check if playing mode is on
            if (this.playing)
            {
                // calculate next drawing point
                const nextPoint = this.drawer.getNextPoint();
                // draw it
                this.drawing.drawNextPoint(nextPoint);
            }
        });

        // on window resized
        fromEvent(window, 'resize').subscribe(() =>
        {
            // reset drawing to avoid distorsion
            this.drawing.resize();
            this.clear();
        });
    }

    /**
     * Automatically assign a random value for radius and position.
     */
    shuffle ()
    {
        this.radius   = Math.random() * 100;
        this.position = Math.random() * 100;
        this.clear();
    }

    /**
     * Erase drawing and reset drawer state.
     */
    clear ()
    {
        this.drawer.reset();
        this.drawing.clear();
    }

    /**
     * Handle radius slider move event.
     * Animation is paused until slider is released.
     * @param event
     */
    onRadiusSliderMoved ( event )
    {
        this.storePlayingStateWhileSliding();
        this.radius = event.value;
        this.clear();
    }

    /**
     * Handle radius slider move event.
     * Animation is paused until slider is released.
     * @param event
     */
    onPositionSliderMoved ( event )
    {
        this.storePlayingStateWhileSliding();
        this.position = event.value;
        this.clear();
    }

    /**
     * Used in slider movement handling.
     * Pause animation if it is playing.
     * Store animation state to be restored once slider is released.
     */
    storePlayingStateWhileSliding ()
    {
        if (this.playing)
        {
            this.wasPlayingBeforeSlidingStarted = true;
            this.playing                        = false;
        }
    }

    /**
     * Restarts animation if it was playing before slider was touched.
     * @param event
     */
    restorePlayingStateOnSliderReleased ( event: MatSliderChange )
    {
        // make sure slider is properly blured when released
        window.setTimeout(() => event.source.blur());

        // restore playing state
        this.playing                        = this.wasPlayingBeforeSlidingStarted;
        this.wasPlayingBeforeSlidingStarted = false;
    }
}
