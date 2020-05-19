import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { AppProvider } from '@8base/react-sdk';
import { Auth, AUTH_STRATEGIES } from '@8base/auth';
import { BoostProvider, AsyncContent } from '@8base/boost';
import { ToastContainer, toast } from 'react-toastify';

import { ProtectedRoute } from 'shared/components';
import { TOAST_SUCCESS_MESSAGE } from 'shared/constants';

import { MainPlate, ContentPlate, Nav } from './components';
import { Auth as AuthCallback } from './routes/auth';
import { Clients } from './routes/clients';
import { ClientPage } from './routes/clients/ClientPage';
import { OrderPage } from './routes/orders/OrderPage';
import { Products } from './routes/products';
import { Orders } from './routes/orders';

const { REACT_APP_8BASE_API_ENDPOINT } = process.env;

const AUTH0_CLIENT_ID = 'qGHZVu5CxY5klivm28OPLjopvsYp0baD';
const AUTH0_CLIENT_DOMAIN = 'auth.8base.com';

const authClient = Auth.createClient(
  {
    strategy: AUTH_STRATEGIES.WEB_AUTH0,
    subscribable: true,
  },
  {
    clientId: AUTH0_CLIENT_ID,
    domain: AUTH0_CLIENT_DOMAIN,
    redirectUri: `${window.location.origin}/auth/callback`,
    logoutRedirectUri: `${window.location.origin}/auth`,
  }
);

class Application extends React.PureComponent {
  renderContent = ({ loading }) => (
    <AsyncContent loading={loading} stretch>
      <Switch>
        <Route path="/auth" component={AuthCallback} />
        <Route>
          <MainPlate>
            <Nav.Plate color="BLUE">
              <Nav.Item icon="Customers" to="/clients" label="Clients" />
              <Nav.Item icon="Contract" to="/orders" label="Orders" />
              <Nav.Item icon="Planet" to="/products" label="Products" />
            </Nav.Plate>
            <ContentPlate>
              <Switch>
                <ProtectedRoute exact path="/clients" component={Clients} />
                <ProtectedRoute exact path="/clients/:clientId" component={ClientPage} />
                <ProtectedRoute exact path="/orders" component={Orders} />
                <ProtectedRoute exact path="/orders/:orderId" component={OrderPage} />
                <ProtectedRoute exact path="/products" component={Products} />
                <Redirect to="/clients" />
              </Switch>
            </ContentPlate>
          </MainPlate>
        </Route>
      </Switch>
    </AsyncContent>
  );

  onRequestSuccess = ({ operation }) => {
    const message = operation.getContext()[TOAST_SUCCESS_MESSAGE];

    if (message) {
      toast.success(message);
    }
  };

  onRequestError = ({ graphQLErrors }) => {
    const hasGraphQLErrors = Array.isArray(graphQLErrors) && graphQLErrors.length > 0;

    if (hasGraphQLErrors) {
      graphQLErrors.forEach(error => {
        toast.error(error.message);
      });
    }
  };

  render() {
    return (
      <BrowserRouter>
        <BoostProvider>
          <AppProvider
            uri={REACT_APP_8BASE_API_ENDPOINT}
            authClient={authClient}
            onRequestSuccess={this.onRequestSuccess}
            onRequestError={this.onRequestError}
          >
            {this.renderContent}
          </AppProvider>
          <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
        </BoostProvider>
      </BrowserRouter>
    );
  }
}

export { Application };
