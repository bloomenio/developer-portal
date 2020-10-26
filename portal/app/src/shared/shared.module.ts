import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';
import { MenuModule } from '@components/menu/menu.module';

import { LottieAnimationViewModule } from 'ng-lottie';
import { AvatarModule } from 'ngx-avatar';

@NgModule({
  imports: [
    FlexLayoutModule,
    MaterialModule,
    CommonModule,
    FormsModule,
    MenuModule,
    AvatarModule,
    LottieAnimationViewModule.forRoot()
  ],
  declarations: [LoaderComponent],
  exports: [
    LoaderComponent,
    FormsModule,
    AvatarModule
  ]
})
export class SharedModule {}
