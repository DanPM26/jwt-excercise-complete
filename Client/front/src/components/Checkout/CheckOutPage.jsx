import React from 'react'
import BtnCheckout from '../Checkout/BtnCheckout'

const CheckoutPage = () => {
  const currency = "USD";
  return (
    <div>
      <h1>CheckoutPage</h1>
      <BtnCheckout
        currency={currency}
        showSpinner={false} />
    </div>
  )
}

export default CheckoutPage
