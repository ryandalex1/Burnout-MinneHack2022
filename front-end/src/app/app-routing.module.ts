import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsPageComponent } from './conversations-page/conversations-page.component';

const routes: Routes = [
  {
    path: "chat",
    component: ConversationsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
