import React from 'react';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { Form as FormLogic, Field, FieldArray } from '@8base/forms';
import {
  AsyncContent,
  Dialog,
  Grid,
  Button,
  Form,
  Row,
  Column,
  Icon,
  Text,
  SelectField,
  InputField,
  CheckboxField,
  DateInputField,
  Label,
  ModalContext,
} from '@8base/boost';
import { AddressInputField, PhoneInputField, ListFields, FileInputField } from '../../shared/components';

const ORDERITEM_QUERY = gql`
  query OrderItemsEntity($id: ID!) {
  orderItem(id: $id) {
    id
    product {
      id
      _description
    }
    order {
      id
      _description
    }
    quantity
  }
} 
`;

const ORDERITEM_UPDATE_MUTATION = gql`
  mutation OrderItemUpdate($data: OrderItemUpdateInput!) {
    orderItemUpdate(data: $data) {
      id
    }
  }
`;

const PRODUCT_LIST_QUERY = gql`
  query ProductsList {
    productsList: productsList {
      items {
        id
        _description
      }
    }
  }
`;
const ORDER_LIST_QUERY = gql`
  query OrdersList {
    ordersList: ordersList {
      items {
        id
        _description
      }
    }
  }
`;

const getRelationOptions = (items = []) =>
  items.map(item => ({ value: item.id, label: item._description || 'Untitled Record' }));

const ehnhancer = graphql(ORDERITEM_UPDATE_MUTATION, {
  name: 'orderItemUpdate',
  options: {
    refetchQueries: ['OrderItemsTableContent', 'OrderItemsList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfully updated',
    },
  },
});

const OrderItemEditDialog = ehnhancer(
  class OrderItemEditDialog extends React.PureComponent {
    static contextType = ModalContext;

    updateOnSubmit = id => async data => {
      await this.props.orderItemUpdate({ variables: { data: { ...data, id } } });

      this.context.closeModal('ORDERITEM_EDIT_DIALOG_ID');
    };

    onClose = () => {
      this.context.closeModal('ORDERITEM_EDIT_DIALOG_ID');
    };

    renderForm = ({ args }) => {
      return (
        <Query query={ORDERITEM_QUERY} variables={{ id: args.id }}>
          {({ data, loading }) => (
            <FormLogic
              type="UPDATE"
              tableSchemaName="OrderItems"
              onSubmit={this.updateOnSubmit(args.id)}
              initialValues={data.orderitem}
              formatRelationToIds
            >
              {({ handleSubmit, invalid, submitting, pristine }) => (
                <form onSubmit={handleSubmit}>
                  <Dialog.Header title="Edit OrderItem" onClose={this.onClose} />
                  <Dialog.Body scrollable>
                    <AsyncContent loading={loading} stretch>
                      <Grid.Layout gap="md" stretch>
                        <Grid.Box>
                          <Query query={PRODUCT_LIST_QUERY}>
                            {({ data, loading }) => (
                              <Field
                                name="product"
                                label="Product"
                                multiple={false}
                                component={SelectField}
                                placeholder="Select a product"
                                loading={loading}
                                options={loading ? [] : getRelationOptions(data.productsList.items)}
                                stretch
                              />
                            )}
                          </Query>
                        </Grid.Box>
                        <Grid.Box>
                          <Query query={ORDER_LIST_QUERY}>
                            {({ data, loading }) => (
                              <Field
                                name="order"
                                label="Order"
                                multiple={false}
                                component={SelectField}
                                placeholder="Select a order"
                                loading={loading}
                                options={loading ? [] : getRelationOptions(data.ordersList.items)}
                                stretch
                              />
                            )}
                          </Query>
                        </Grid.Box>
                        <Grid.Box>
                          <Field name="quantity" label="Quantity" type="number" component={InputField} />
                        </Grid.Box>
                      </Grid.Layout>
                    </AsyncContent>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button
                      color="neutral"
                      type="button"
                      variant="outlined"
                      disabled={submitting}
                      onClick={this.onClose}
                    >
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" disabled={pristine || invalid} loading={submitting}>
                      Update OrderItem
                    </Button>
                  </Dialog.Footer>
                </form>
              )}
            </FormLogic>
          )}
        </Query>
      );
    };

    render() {
      return (
        <Dialog id={'ORDERITEM_EDIT_DIALOG_ID'} size="sm">
          {this.renderForm}
        </Dialog>
      );
    }
  }
);

export { OrderItemEditDialog };
