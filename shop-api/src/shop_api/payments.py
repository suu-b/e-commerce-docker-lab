from flask import Blueprint, request, jsonify, g
from .db import get_db_connection
from .auth import require_auth
import uuid

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/payments', methods=['POST'])
@require_auth
def create_payment():
    """Create a dummy payment - always returns success."""
    data = request.get_json()
    order_id = data.get('order_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')

    if not all([order_id, amount, payment_method]):
        return jsonify({'error': 'Missing required fields: order_id, amount, payment_method'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Verify order belongs to user
            cursor.execute(
                """
                SELECT id FROM orders
                WHERE user_id = %s AND id = %s
                """,
                (g.user_id, order_id)
            )
            order = cursor.fetchone()

            if not order:
                return jsonify({'error': 'Order not found'}), 404

            # Create dummy payment record
            transaction_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO payments (order_id, amount, status, payment_method, transaction_id)
                VALUES (%s, %s, 'completed', %s, %s)
                RETURNING id
                """,
                (order_id, amount, payment_method, transaction_id)
            )
            payment_id = cursor.fetchone()[0]

            # Update order status to processing
            cursor.execute(
                """
                UPDATE orders
                SET status = 'processing'
                WHERE id = %s
                """,
                (order_id,)
            )

            return jsonify({
                'message': 'Payment successful',
                'payment_id': str(payment_id),
                'transaction_id': transaction_id,
                'status': 'completed'
            }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/payments/<payment_id>', methods=['GET'])
@require_auth
def get_payment(payment_id):
    """Get payment details."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT p.id, p.order_id, p.amount, p.status, p.payment_method, p.transaction_id, p.created_at,
                       o.user_id
                FROM payments p
                JOIN orders o ON p.order_id = o.id
                WHERE p.id = %s
                """,
                (payment_id,)
            )
            payment = cursor.fetchone()

            if not payment:
                return jsonify({'error': 'Payment not found'}), 404

            # Verify payment belongs to user's order
            if str(payment[7]) != g.user_id:
                return jsonify({'error': 'Access denied'}), 403

            return jsonify({
                'payment': {
                    'id': str(payment[0]),
                    'order_id': str(payment[1]),
                    'amount': str(payment[2]),
                    'status': payment[3],
                    'payment_method': payment[4],
                    'transaction_id': payment[5],
                    'created_at': payment[6].isoformat() if payment[6] else None
                }
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/payments/refund/<payment_id>', methods=['POST'])
@require_auth
def refund_payment(payment_id):
    """Dummy refund endpoint - always returns success."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT p.id, p.order_id, p.status, o.user_id
                FROM payments p
                JOIN orders o ON p.order_id = o.id
                WHERE p.id = %s
                """,
                (payment_id,)
            )
            payment = cursor.fetchone()

            if not payment:
                return jsonify({'error': 'Payment not found'}), 404

            # Verify payment belongs to user's order
            if str(payment[3]) != g.user_id:
                return jsonify({'error': 'Access denied'}), 403

            # Update payment status to refunded
            cursor.execute(
                """
                UPDATE payments
                SET status = 'refunded'
                WHERE id = %s
                """,
                (payment_id,)
            )

            return jsonify({
                'message': 'Refund processed successfully',
                'payment_id': str(payment_id),
                'status': 'refunded'
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
