import React from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';

// import { Spinner } from 'ui';
import StripeCheckout from './stripe';

// You can get this from https://dashboard.stripe.com/test/apikeys in test mode
const stripeClientSecret = 'stripe';

// const Outer = styled.div`
//   flex-grow: 1;
//   flex: 0 1 500px;
//   background: #eee;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1.5rem;
//   min-height: 500px;
// `;

// const Outer = styled.div`
//   flex-grow: 1;
// `;

// const InitiatingText = styled.div`
//   margin-right: 15px;
// `;

class PaymentGateway extends React.Component {
  state = {
    // chosenPaymentMethod: null,
    clientSecret: null,
    stripe: null
  };

  async componentDidMount() {
    const { items } = this.props;

    const lineItems = items.map(item => ({
      id: item.id,
      path: item.path,
      quantity: item.quantity
    }));

    const { client_secret } = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        lineItems
      })
    }).then(res => res.json());

    if (window.Stripe) {
      this.setState({
        stripe: window.Stripe(stripeClientSecret),
        clientSecret: client_secret
      });
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({
          stripe: window.Stripe(stripeClientSecret),
          clientSecret: client_secret
        });
      });
    }
  }

  render() {
    const { items } = this.props;
    const { clientSecret, stripe } = this.state;

    if (!stripe) {
      return null;
    }

    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <StripeCheckout clientSecret={clientSecret} items={items} />
        </Elements>
      </StripeProvider>
    );

    // TODO: Allow multiple payment gateways
    // return (
    //   <Outer>
    //     <h2>Choose a way to pay:</h2>
    //     <div>
    //       <button
    //         type="button"
    //         onClick={() => this.setState({ chosenPaymentMethod: 'stripe' })}
    //       >
    //         Stripe
    //       </button>
    //       <button type="button">Klarna</button>
    //     </div>
    //   </Outer>
    // );
  }
}

export default PaymentGateway;
