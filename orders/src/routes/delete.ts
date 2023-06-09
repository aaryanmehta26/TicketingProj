import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@amehtatickets/common';
import express, { Request, Response } from 'express'
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            // to make sure user is seeing its own order, not other user order
            throw new NotAuthorizedError();
        }
        // update the order status, to cancelled
        // note-> we are not deleting anything from database, but we are just updating the orderStatus
        order.status = OrderStatus.Cancelled;
        await order.save();

        // publishing an event, saying order was cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        res.sendStatus(204).send(order);

    })

export { router as deleteOrderRouter };