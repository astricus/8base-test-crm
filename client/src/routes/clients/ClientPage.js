import React from 'react';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card, Heading } from '@8base/boost';
import { ClientOrdersTable } from './ClientOrdersTable';

const CLIENT_QUERY = gql`
  query ClientsEntity($id: ID!) {
    client(id: $id) {
      id
      firstName
      lastName
      email
      phone
      birthday
      orders {
        items {
          id
          _description
        }
        count
      }
    }
  }
`;

export const ClientPage = withRouter(({ match }) => {
  const { clientId } = match.params;
  console.log(match.params.clientId);
  return (
    <Card padding="md" stretch>
      <Query query={CLIENT_QUERY} variables={{ id: clientId }}>
        {({ data, loading }) => {
          if (!loading) {
            // console.log(data);
            return (
              <>
                <Card.Header>
                  <Heading type="h4" text={`${data.client.firstName} ${data.client.lastName}`} />
                </Card.Header>

                <Card.Body padding="none" stretch scrollable>
                  <ClientOrdersTable key={clientId} />
                </Card.Body>
              </>
            );
          } else return null;
        }}
      </Query>
    </Card>
  );
});
