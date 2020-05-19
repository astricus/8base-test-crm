import React from 'react';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import objectPath from 'object-path';
import { compose } from 'recompose';
import { Query } from 'react-apollo';
import { DateTime } from 'luxon';
import { TableBuilder, Tag, Row } from '@8base/boost';
import { FIELD_TYPE, DATE_FORMATS, SWITCH_FORMATS, SWITCH_VALUES } from '@8base/utils';

const ORDERS_LIST_QUERY = gql`
  query OrdersTableContent(
    $id: ID!
    $orderBy: [OrderOrderBy]
    $after: String
    $before: String
    $first: Int
    $last: Int
    $skip: Int
  ) {
    ordersList(
      filter: { client: { id: { equals: $id } } }
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      skip: $skip
    ) {
      items {
        id
        createdAt
        updatedAt
        createdBy {
          id
          _description
        }
        client {
          id
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
        _description
      }
      count
    }
  }
`;

const TABLE_COLUMNS = [
  {
    name: 'createdAt',
    title: 'CreatedAt',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.DATE,
      fieldTypeAttributes: {
        format: 'DATETIME',
      },
    },
  },
  {
    name: 'address',
    title: 'Address',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'deliveryDt',
    title: 'DeliveryDt',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.DATE,
      fieldTypeAttributes: {
        format: 'DATETIME',
      },
    },
  },
  {
    name: 'orderItems',
    title: 'OrderItems',
    meta: {
      isList: true,
      fieldType: FIELD_TYPE.RELATION,
      fieldTypeAttributes: {
        format: '',
      },
    },
  },
  {
    name: 'status',
    title: 'Status',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.SWITCH,
      fieldTypeAttributes: {
        format: 'CUSTOM',
      },
    },
  },
  {
    name: 'totalPrice',
    title: 'Total price',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.NUMBER,
      fieldTypeAttributes: {
        format: 'NUMBER',
      },
    },
  },
];

const enhancer = compose(withRouter);

const ClientOrdersTable = enhancer(
  class ClientOrdersTable extends React.PureComponent {
    renderItems = (column, rowData, handler) => {
      const dataPath = column.name.split('.');
      const cellData = objectPath.get(rowData, dataPath) || '';

      if (column.meta.isList) {
        const itemsArray = cellData.items ? cellData.items : cellData;

        return (
          <Row style={{ flexWrap: 'wrap' }}>
            {itemsArray && itemsArray.map(item => !!item && <Tag color="LIGHT_GRAY2">{handler(item)}</Tag>)}
          </Row>
        );
      } else {
        return cellData && <div>{handler(cellData)}</div>;
      }
    };

    renderNumber = number => Math.round(number * 100) / 100;

    renderTotalPrice = rowData => {
      const totalPrice = this.renderNumber(
        rowData.orderItems.items.reduce((accumulator, item) => item.product.price * item.quantity + accumulator, 0)
      );
      return totalPrice;
    };

    renderScalar = (column, rowData) => {
      if (column.name === 'totalPrice') {
        return this.renderTotalPrice(rowData);
      } else return this.renderItems(column, rowData, item => item);
    };

    renderDate = (column, rowData) => {
      const dateFormat =
        column.meta.fieldTypeAttributes.format === DATE_FORMATS.DATE ? DateTime.DATE_SHORT : DateTime.DATETIME_SHORT;

      return this.renderItems(column, rowData, item => DateTime.fromISO(item).toLocaleString(dateFormat));
    };

    renderSwitch = (column, rowData) => {
      if (column.meta.fieldTypeAttributes.format === SWITCH_FORMATS.CUSTOM) {
        return this.renderItems(column, rowData, item => item);
      } else {
        return this.renderItems(column, rowData, item => SWITCH_VALUES[column.meta.fieldTypeAttributes.format][item]);
      }
    };

    renderOrderItems = data => {
      const itemsArray = data.orderItems.items;
      return (
        <Row style={{ flexWrap: 'wrap' }}>
          {itemsArray &&
            itemsArray.map(
              item =>
                !!item && (
                  <Tag color="GRAY_40">
                    {item.product.name} - ${item.product.price} x {item.quantity}pcs
                  </Tag>
                )
            )}
        </Row>
      );
    };

    renderRelation = (column, rowData) => {
      const dataPath = column.name.split('.');
      if (column.name === 'orderItems') {
        return this.renderOrderItems(rowData);
      } else if (column.meta.isList) {
        return objectPath.get(rowData, [...dataPath, 'count']) || '';
      } else {
        return objectPath.get(rowData, [...dataPath, '_description']) || '';
      }
    };

    renderCell = (column, rowData) => {
      switch (column.meta.fieldType) {
        case FIELD_TYPE.TEXT:
        case FIELD_TYPE.NUMBER:
          return this.renderScalar(column, rowData);

        case FIELD_TYPE.DATE:
          return this.renderDate(column, rowData);

        case FIELD_TYPE.SWITCH:
          return this.renderSwitch(column, rowData);

        case FIELD_TYPE.RELATION:
          return this.renderRelation(column, rowData);

        default:
          return null;
      }
    };

    openCreateModal = () => {
      const { openModal } = this.props;

      openModal('ORDER_CREATE_DIALOG_ID');
    };

    render() {
      return (
        <Query query={ORDERS_LIST_QUERY} variables={{ id: this.props.match.params.clientId }}>
          {({ data, loading }) => {
            if (loading) {
              return <p>loading...</p>;
            } else {
              const tableData = objectPath.get(data, ['ordersList', 'items']) || [];
              return (
                <TableBuilder
                  loading={loading}
                  data={tableData}
                  columns={TABLE_COLUMNS}
                  action="Create Order"
                  renderCell={this.renderCell}
                  onActionClick={this.openCreateModal}
                />
              );
            }
          }}
        </Query>
      );
    }
  }
);

export { ClientOrdersTable };
