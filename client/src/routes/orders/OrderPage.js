import React from 'react';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { DateTime } from 'luxon';
import { Card, Heading, Table, Tag, Row } from '@8base/boost';

const ORDER_QUERY = gql`
  query OrdersEntity($id: ID!) {
    order(id: $id) {
      id
      client {
        id
        firstName
        lastName
        email
        _description
      }
      address
      deliveryDt
      comment
      orderItems {
        items {
          id
          _description
          product {
            name
            price
          }
          quantity
        }
        count
      }
      status
    }
  }
`;

const renderDate = date => {
  const dateFormat = DateTime.DATETIME_SHORT;

  const formattedDate = DateTime.fromISO(date).toLocaleString(dateFormat);
  return formattedDate;
};

const renderNumber = number => Math.round(number * 100) / 100;

const renderTotalPrice = rowData => {
  const totalPrice = renderNumber(
    rowData.orderItems.items.reduce((accumulator, item) => item.product.price * item.quantity + accumulator, 0)
  );
  return `$${totalPrice}`;
};

export const OrderPage = withRouter(({ match }) => {
  const { orderId } = match.params;
  console.log(match.params);
  return (
    <Card padding="md" stretch>
      <Query query={ORDER_QUERY} variables={{ id: orderId }}>
        {({ data, loading }) => {
          if (!loading) {
            console.log(data);
            const { order } = data;
            return (
              <>
                <Card.Header>
                  <Heading type="h4" text="Order info" />
                </Card.Header>

                <Card.Body padding="none" stretch scrollable>
                  <Table>
                    <Table.Header columns="repeat(7, 1fr)">
                      <Table.HeaderCell>Client</Table.HeaderCell>
                      <Table.HeaderCell>Address</Table.HeaderCell>
                      <Table.HeaderCell>Email</Table.HeaderCell>
                      <Table.HeaderCell>Products</Table.HeaderCell>
                      <Table.HeaderCell>Total Price</Table.HeaderCell>
                      <Table.HeaderCell>deliveryDt</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Header>

                    <Table.Body data={[order]}>
                      {item => (
                        <Table.BodyRow columns="repeat(7, 1fr)" key={order.id}>
                          <Table.BodyCell>{`${order.client.firstName} ${order.client.lastName}`}</Table.BodyCell>
                          <Table.BodyCell>{order.address}</Table.BodyCell>
                          <Table.BodyCell>{order.client.email}</Table.BodyCell>
                          <Table.BodyCell>
                            <Row style={{ flexWrap: 'wrap' }}>
                              {order.orderItems.items.map(item => (
                                <Tag color="GRAY_40">
                                  {item.product.name} - ${item.product.price} x {item.quantity}pcs
                                </Tag>
                              ))}
                            </Row>
                          </Table.BodyCell>
                          <Table.BodyCell>{renderTotalPrice(order)}</Table.BodyCell>
                          <Table.BodyCell>{renderDate(order.deliveryDt)}</Table.BodyCell>
                          <Table.BodyCell>{order.status}</Table.BodyCell>
                        </Table.BodyRow>
                      )}
                    </Table.Body>
                  </Table>
                </Card.Body>
              </>
            );
          } else return null;
        }}
      </Query>
    </Card>
  );
});
