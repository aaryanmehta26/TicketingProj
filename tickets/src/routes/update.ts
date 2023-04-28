import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@amehtatickets/common';
import { body } from 'express-validator';

const router = express.Router();

router.put("/api/tickets/:id",
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title must be provided'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be provided and must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            throw new NotFoundError();
        }

        // make sure user is editing its own ticket
        if (ticket.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        // update the ticket
        ticket.set({
            title: req.body.title,
            price: req.body.price
        })
        await ticket.save()

        res.send(ticket);
    });

export { router as updateTicketRouter };