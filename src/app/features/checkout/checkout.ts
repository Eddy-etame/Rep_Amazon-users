import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

import { CartStore } from '../../core/services/cart.store';

@Component({
  selector: 'app-checkout',
  imports: [DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  constructor(private readonly cart: CartStore) {}

  get items() {
    return this.cart.items;
  }

  get totalPrice() {
    return this.cart.totalPrice;
  }
}
