import React from 'react';
import gql from 'graphql-tag';
import { Form as FormLogic } from '@8base/forms';
import { Dialog, Button, ModalContext } from '@8base/boost';
import { graphql } from 'react-apollo';

const ORDERITEM_DELETE_MUTATION = gql`
  mutation OrderItemDelete($id: ID!) {
    orderItemDelete(data: { id: $id }) {
      success
    }
  }
`;

const enhancer = graphql(ORDERITEM_DELETE_MUTATION, {
  name: 'orderItemDelete',
  options: {
    refetchQueries: ['OrderItemsTableContent', 'OrderItemsList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfully deleted',
    },
  },
});

const OrderItemDeleteDialog = enhancer(
  class OrderItemDeleteDialog extends React.Component {
    static contextType = ModalContext;

    createOnSubmit = id => async () => {
      await this.props.orderItemDelete({ variables: { id } });

      this.context.closeModal('ORDERITEM_DELETE_DIALOG_ID');
    };

    onClose = () => {
      this.context.closeModal('ORDERITEM_DELETE_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="Delete OrderItem" onClose={this.onClose} />
        <Dialog.Body scrollable>Do you really want to delete orderitem?</Dialog.Body>
        <Dialog.Footer>
          <Button color="neutral" variant="outlined" disabled={submitting} onClick={this.onClose}>
            Cancel
          </Button>
          <Button color="danger" type="submit" disabled={invalid} loading={submitting}>
            Delete OrderItem
          </Button>
        </Dialog.Footer>
      </form>
    );

    renderContent = ({ args }) => {
      return (
        <FormLogic onSubmit={this.createOnSubmit(args.id)} formatRelationToIds>
          {this.renderFormContent}
        </FormLogic>
      );
    };

    render() {
      return (
        <Dialog id={'ORDERITEM_DELETE_DIALOG_ID'} size="sm">
          {this.renderContent}
        </Dialog>
      );
    }
  }
);

export { OrderItemDeleteDialog };
