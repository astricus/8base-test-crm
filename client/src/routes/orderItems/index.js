import React from 'react';
import { Card, Heading } from '@8base/boost';

import { OrderItemCreateDialog } from './OrderItemCreateDialog';
import { OrderItemEditDialog } from './OrderItemEditDialog';
import { OrderItemDeleteDialog } from './OrderItemDeleteDialog';
import { OrderItemsTable } from './OrderItemsTable';

const OrderItems = () => (
  <Card padding="md" stretch>
    <Card.Header>
      <Heading type="h4" text=" OrderItems" />
    </Card.Header>

    <OrderItemCreateDialog />
    <OrderItemEditDialog />
    <OrderItemDeleteDialog />
    <Card.Body padding="none" stretch scrollable>
      <OrderItemsTable />
    </Card.Body>
  </Card>
);

export { OrderItems };
