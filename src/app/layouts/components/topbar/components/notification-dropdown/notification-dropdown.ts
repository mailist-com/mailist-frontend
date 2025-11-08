import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";
import { SimplebarAngularModule } from "simplebar-angular";

@Component({
  selector: 'app-notification-dropdown',
  imports: [NgIcon, RouterLink, SimplebarAngularModule],
  templateUrl: './notification-dropdown.html',
  standalone: true,
  styles: ``
})
export class NotificationDropdown {

}
