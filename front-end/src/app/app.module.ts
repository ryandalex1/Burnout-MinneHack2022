import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule } from "@angular/material/core";
import { MatDividerModule } from "@angular/material/divider";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginPageComponent } from './page/login-page/login-page.component';
import { ConversationsPageComponent } from './page/conversations-page/conversations-page.component';
import { FormsModule } from '@angular/forms';
import {SidebarComponent} from "./component/sidebar/sidebar.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import { ContactComponent } from './component/contact/contact.component';
import { CloseBurnerDialogComponent } from './dialog/close-burner-dialog/close-burner-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {NewConversationDialogComponent} from "./dialog/new-conversation-dialog/new-conversation-dialog.component";
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    ConversationsPageComponent,
    LoginPageComponent,
    SidebarComponent,
    ContactComponent,
    CloseBurnerDialogComponent,
    NewConversationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatRippleModule,
    MatDividerModule,
    MatDialogModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
