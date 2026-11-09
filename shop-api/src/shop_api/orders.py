from flask import Blueprint, request, jsonify, g
from .db import get_db_connection
from .auth import require_auth

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/orders', methods=['POST'])
@require_auth
def create_order():
    """Create a new order with order items."""
    data = request.get_json()
    items = data.get('items')

    if not items or not isinstance(items, list):
        return jsonify({'error': 'items is required and must be a list'}), 400

    # Validate each item
    for item in items:
        if not all([item.get('product_id'), item.get('quantity'), item.get('unit_price')]):
            return jsonify({'error': 'Each item must have product_id, quantity, and unit_price'}), 400
        if item['quantity'] <= 0:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Create the order
            cursor.execute(
                """
                INSERT INTO orders (user_id, status)
                VALUES (%s, 'pending')
                RETURNING id
                """,
                (g.user_id,)
            )
            order_id = cursor.fetchone()[0]

            # Create order items
            for item in items:
                cursor.execute(
                    """
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (order_id, item['product_id'], item['quantity'], item['unit_price'])
                )

            return jsonify({
                'message': 'Order created successfully',
                'order_id': str(order_id)
            }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/orders', methods=['GET'])
@require_auth
def list_orders():
    """List all orders for the authenticated user."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, status, created_at
                FROM orders
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (g.user_id,)
            )
            orders = cursor.fetchall()

            return jsonify({
                'orders': [
                    {
                        'id': str(order[0]),
                        'status': order[1],
                        'created_at': order[2].isoformat() if order[2] else None
                    }
                    for order in orders
                ]
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/orders/<order_id>', methods=['GET'])
@require_auth
def get_order(order_id):
    """Get a specific order with its items."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Get order details
            cursor.execute(
                """
                SELECT id, status, created_at
                FROM orders
                WHERE user_id = %s AND id = %s
                """,
                (g.user_id, order_id)
            )
            order = cursor.fetchone()

            if not order:
                return jsonify({'error': 'Order not found'}), 404

            # Get order items
            cursor.execute(
                """
                SELECT id, product_id, quantity, unit_price
                FROM order_items
                WHERE order_id = %s
                """,
                (order_id,)
            )
            items = cursor.fetchall()

            return jsonify({
                'order': {
                    'id': str(order[0]),
                    'status': order[1],
                    'created_at': order[2].isoformat() if order[2] else None,
                    'items': [
                        {
                            'id': str(item[0]),
                            'product_id': str(item[1]),
                            'quantity': item[2],
                            'unit_price': str(item[3])
                        }
                        for item in items
                    ]
                }
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/orders/<order_id>/status', methods=['PUT'])
@require_auth
def update_order_status(order_id):
    """Update the status of an order."""
    data = request.get_json()
    status = data.get('status')

    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if not status or status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE orders
                SET status = %s
                WHERE user_id = %s AND id = %s
                RETURNING id
                """,
                (status, g.user_id, order_id)
            )
            result = cursor.fetchone()

            if not result:
                return jsonify({'error': 'Order not found'}), 404

            return jsonify({'message': 'Order status updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
