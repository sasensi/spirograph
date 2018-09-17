import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import * as paper from 'paper';
import { fromEvent, interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { scan } from 'rxjs/operators';
import { DrawerComponent } from './components/drawer/drawer.component';
import { DrawingComponent } from './components/drawing/drawing.component';

@Component({
    selector: 'app-root',
    template: `
        <header *ngIf="infosVisibles">spirograph</header>
        <app-drawer [hidden]="!infosVisibles" [radius]="radius" [position]="position"></app-drawer>
        <app-drawing></app-drawing>
        <footer>
            <div *ngIf="infosVisibles">
                <mat-slider [(ngModel)]="radius" (input)="onRadiusChange($event)" (change)="restorePlayingStateOnSliderReleased($event)"></mat-slider>
                <mat-slider [(ngModel)]="position" (input)="onPositionChange($event)" (change)="restorePlayingStateOnSliderReleased($event)"></mat-slider>
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
            <a href="samuelasensi.com" target="_blank">Samuel ASENSI</a> (<a href="https://github.com/sasensi/spirograph" target="_blank">code</a>)
        </aside>
    `,
    styles  : [
            `
            :host {
                font-family : monospace;
            }

            header {
                position   : fixed;
                width      : 100%;
                text-align : center;
                top        : 20px;
                left       : 0;
                font-size  : 16px;
            }

            footer {
                position        : fixed;
                bottom          : 20px;
                left            : 0;
                width           : 100%;
                display         : flex;
                flex-direction  : column;
                justify-content : center;
                align-items     : center;
            }

            footer > div {
                display         : flex;
                justify-content : center;
                align-items     : center;
            }

            aside {
                position  : fixed;
                bottom    : 10px;
                right     : 10px;
                font-size : 10px;
            }

            aside a {
                color : inherit;
            }

            :host /deep/ canvas {
                position : absolute;
                top      : 0;
                left     : 0;
                width    : 100vw;
                height   : 100vh;
                z-index  : 0;
            }
            `,
    ],
})
export class AppComponent implements AfterViewInit
{
    @ViewChild(DrawerComponent) drawer: DrawerComponent;
    @ViewChild(DrawingComponent) drawing: DrawingComponent;

    playing                        = false;
    radius: number                 = 33;
    position: number               = 33;
    infosVisibles                  = true;
    wasPlayingBeforeSlidingStarted = false;

    ngAfterViewInit ()
    {
        interval(0, animationFrame).subscribe(() =>
        {
            if (this.playing)
            {
                const nextPoint = this.drawer.getNextPoint();
                this.drawing.drawNextPoint(nextPoint);
            }
        });

        fromEvent(window, 'resize').subscribe(() =>
        {
            this.drawing.resize();
            this.clear();
        });
    }

    shuffle ()
    {
        this.radius   = Math.random() * 100;
        this.position = Math.random() * 100;
        this.clear();
        this.play();
    }

    play ()
    {
        this.playing = true;
    }

    pause ()
    {
        this.playing = false;
    }

    clear ()
    {
        this.drawer.reset();
        this.drawing.clear();
    }

    onRadiusChange ( event )
    {
        this.storePlayingStateWhileSliding();
        this.radius = event.value;
        this.clear();
    }

    onPositionChange ( event )
    {
        this.storePlayingStateWhileSliding();
        this.position = event.value;
        this.clear();
    }

    storePlayingStateWhileSliding ()
    {
        if (this.playing)
        {
            this.wasPlayingBeforeSlidingStarted = true;
            this.pause();
        }
    }

    restorePlayingStateOnSliderReleased ( event: MatSliderChange )
    {
        // make sure slider is properly blured when released
        window.setTimeout(() => event.source.blur());

        this.playing                        = this.wasPlayingBeforeSlidingStarted;
        this.wasPlayingBeforeSlidingStarted = false;
    }
}
