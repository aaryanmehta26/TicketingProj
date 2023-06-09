import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@amehtatickets/common'
import { stripe } from '../../stripe'

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exists', async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.getCookie())
        .send({
            token: "bewibfuew",
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
})

it('returns a 401 when purchasing an order that dosent belongs to the user', async () => {
    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    })

    await order.save();

    await request(app)
        .post("/api/payments")
        .set('Cookie', global.getCookie())
        .send({
            token: "bewibfuew",
            orderId: order.id
        })
        .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    })

    await order.save();

    await request(app)
        .post("/api/payments")
        .set('Cookie', global.getCookie(userId))
        .send({
            token: "bewibfuew",
            orderId: order.id
        })
        .expect(400)
})

