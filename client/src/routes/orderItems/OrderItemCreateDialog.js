import React from 'react';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { Form as FormLogic, Field, FieldArray } from '@8base/forms';
import {
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

const ORDERITEM_CREATE_MUTATION = gql`
  mutation OrderItemCreate($data: OrderItemCreateInput!) {
    orderItemCreate(data: $data) {
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

const enhancer = graphql(ORDERITEM_CREATE_MUTATION, {
  name: 'orderItemCreate',
  options: {
    refetchQueries: ['OrderItemsTableContent', 'OrderItemsList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfully created',
    },
  },
});

const OrderItemCreateDialog = enhancer(
  class OrderItemCreateDialog extends React.PureComponent {
    static contextType = ModalContext;

    onSubmit = async data => {
      await this.props.orderItemCreate({ variables: { data } });

      this.context.closeModal('ORDERITEM_CREATE_DIALOG_ID');
    };

    onClose = () => {
      this.context.closeModal('ORDERITEM_CREATE_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="New OrderItem" onClose={this.onClose} />
        <Dialog.Body scrollable>
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
        </Dialog.Body>
        <Dialog.Footer>
          <Button color="neutral" type="button" variant="outlined" disabled={submitting} onClick={this.onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" loading={submitting}>
            Create OrderItem
          </Button>
        </Dialog.Footer>
      </form>
    );

    render() {
      return (
        <Dialog id={'ORDERITEM_CREATE_DIALOG_ID'} size="sm">
          <FormLogic type="CREATE" tableSchemaName="OrderItems" onSubmit={this.onSubmit} formatRelationToIds>
            {this.renderFormContent}
          </FormLogic>
        </Dialog>
      );
    }
  }
);

export { OrderItemCreateDialog };
