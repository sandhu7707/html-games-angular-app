import { Routes } from '@angular/router';
import { FormComponentComponent } from './form-component/form-component.component';
import { ProductsComponent } from './products/products.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { GameFrameComponent } from './game-frame/game-frame.component';
import { AddGameComponent } from './add-game/add-game.component';

export const routes: Routes = [
    {path: "login", component: FormComponentComponent, title: "SignIn/ Register"},
    {path: "profile", component: ProfileComponent, title: "Profile"},
    {path: "products", component: ProductsComponent, title: "Products", children: [
        {path: "game-area/:gameId/:roomId", component: GameFrameComponent, title: "Game Area"}
    ]},
    {path: "add-game", component: AddGameComponent, title: "Add Game"},
    
    {path: "home", redirectTo:"products", pathMatch: "full"},
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "**", component: PageNotFoundComponent, title: "Not found"}
];
