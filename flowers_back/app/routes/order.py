from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.order import Order, OrderStatus, OrderResponse
from app.models.order import Order as OrderDb
from app.models.order import OrderItem as OrderItemDb
from sqlalchemy.orm import Session
from app.core.database import get_db  
from typing import List

router = APIRouter()

@router.post("/")
async def create_order(order: Order, db: Session = Depends(get_db)):
    try:
        # Создание записи заказа
        db_order = OrderDb(
            full_name=order.fullName,
            phone_number=order.phoneNumber,
            recipient_name=order.recipientName,
            recipient_phone=order.recipientPhone,
            city=order.city,
            street=order.street,
            house=order.house,
            building=order.building,
            apartment=order.apartment,
            delivery_method=order.deliveryMethod,
            delivery_date=order.deliveryDate,
            delivery_time=order.deliveryTime,
            wishes=order.wishes,
            card_text=order.cardText,
            is_self_pickup=order.isSelfPickup,
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        for item in order.items:
            db_item = OrderItemDb(
                order_id=db_order.id,
                product_id=item.id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
            )
            db.add(db_item)

        db.commit()

        return {"message": "Order created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing order: {str(e)}")

@router.get("/", response_model=List[OrderResponse])
async def get_orders(db: Session = Depends(get_db)):
    try:
        orders = db.query(OrderDb).filter(OrderDb.is_sent == False).all()

        for order in orders:
            order.is_sent = True
        db.commit()
        print(orders)
        
        order_responses = [OrderResponse.from_orm(order) for order in orders]

        return order_responses
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")

@router.get("/status", response_model=List[OrderResponse])
async def get_orders_by_status(
    status: OrderStatus = Query(..., description="Фильтр по статусу заказа"),
    db: Session = Depends(get_db),
):
    try:
        orders = db.query(OrderDb).filter(OrderDb.status == status).all()
        order_responses = [OrderResponse.from_orm(order) for order in orders]

        return order_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")
