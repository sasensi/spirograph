import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatSliderModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { DrawingComponent } from './components/drawing/drawing.component';

@NgModule({
    declarations: [
        AppComponent,
        DrawerComponent,
        DrawingComponent,
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        MatSliderModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
    ],
    providers   : [],
    bootstrap   : [ AppComponent ],
})
export class AppModule
{
}
