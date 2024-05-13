import { Routes } from '@angular/router';
import { FormComponentComponent } from './form-component/form-component.component';
import { ProductsComponent } from './products/products.component';
import { MinesweeperComponent } from './product-items/minesweeper/minesweeper.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {path: "profile", component: FormComponentComponent, title: "Profile"},
    {path: "products/:id", component: ProductsComponent, title: "Products",
        children: [
            {path: "minesweeper/:id", component: MinesweeperComponent, title: "Minesweeper"}
        ]
    },
    {path: "home", component: HomeComponent},
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "**", component: PageNotFoundComponent, title: "Not found"}
];
