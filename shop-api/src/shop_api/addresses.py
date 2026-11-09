from flask import Blueprint, request, jsonify, g
from .db import get_db_connection
from .auth import require_auth

addresses_bp = Blueprint('addresses', __name__)


@addresses_bp.route('/addresses', methods=['POST'])
@require_auth
def create_address():
    """Create a new address for the authenticated user."""
    data = request.get_json()
    full_name = data.get('full_name')
    phone = data.get('phone')
    address_line = data.get('address_line')
    city = data.get('city')
    state = data.get('state')
    postal_code = data.get('postal_code')
    country = data.get('country')
    is_default = data.get('is_default', False)

    if not all([full_name, phone, address_line, city, state, postal_code, country]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # If setting as default, unset other default addresses
            if is_default:
                cursor.execute(
                    """
                    UPDATE addresses
                    SET is_default = false
                    WHERE user_id = %s
                    """,
                    (g.user_id,)
                )

            cursor.execute(
                """
                INSERT INTO addresses
                (user_id, full_name, phone, address_line, city, state, postal_code, country, is_default)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (g.user_id, full_name, phone, address_line, city, state, postal_code, country, is_default)
            )
            address_id = cursor.fetchone()[0]

            return jsonify({
                'message': 'Address created successfully',
                'address_id': str(address_id)
            }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@addresses_bp.route('/addresses/<address_id>', methods=['PUT'])
@require_auth
def update_address(address_id):
    """Update an existing address."""
    data = request.get_json()
    full_name = data.get('full_name')
    phone = data.get('phone')
    address_line = data.get('address_line')
    city = data.get('city')
    state = data.get('state')
    postal_code = data.get('postal_code')
    country = data.get('country')
    is_default = data.get('is_default')

    # Build dynamic update query
    update_fields = []
    values = []
    params = []

    if full_name is not None:
        update_fields.append("full_name = %s")
        params.append(full_name)
    if phone is not None:
        update_fields.append("phone = %s")
        params.append(phone)
    if address_line is not None:
        update_fields.append("address_line = %s")
        params.append(address_line)
    if city is not None:
        update_fields.append("city = %s")
        params.append(city)
    if state is not None:
        update_fields.append("state = %s")
        params.append(state)
    if postal_code is not None:
        update_fields.append("postal_code = %s")
        params.append(postal_code)
    if country is not None:
        update_fields.append("country = %s")
        params.append(country)
    if is_default is not None:
        update_fields.append("is_default = %s")
        params.append(is_default)

    if not update_fields:
        return jsonify({'error': 'No fields to update'}), 400

    params.append(g.user_id)
    params.append(address_id)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # If setting as default, unset other default addresses
            if is_default:
                cursor.execute(
                    """
                    UPDATE addresses
                    SET is_default = false
                    WHERE user_id = %s
                    """,
                    (g.user_id,)
                )

            query = f"""
                UPDATE addresses
                SET {', '.join(update_fields)}
                WHERE user_id = %s AND id = %s
                RETURNING id
            """
            cursor.execute(query, params)
            result = cursor.fetchone()

            if not result:
                return jsonify({'error': 'Address not found'}), 404

            return jsonify({'message': 'Address updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@addresses_bp.route('/addresses/<address_id>', methods=['DELETE'])
@require_auth
def delete_address(address_id):
    """Delete an address."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                DELETE FROM addresses
                WHERE user_id = %s AND id = %s
                RETURNING id
                """,
                (g.user_id, address_id)
            )
            result = cursor.fetchone()

            if not result:
                return jsonify({'error': 'Address not found'}), 404

            return jsonify({'message': 'Address deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@addresses_bp.route('/addresses', methods=['GET'])
@require_auth
def list_addresses():
    """List all addresses for the authenticated user."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, full_name, phone, address_line, city, state, postal_code, country, is_default
                FROM addresses
                WHERE user_id = %s
                ORDER BY is_default DESC
                """,
                (g.user_id,)
            )
            addresses = cursor.fetchall()

            return jsonify({
                'addresses': [
                    {
                        'id': str(addr[0]),
                        'full_name': addr[1],
                        'phone': addr[2],
                        'address_line': addr[3],
                        'city': addr[4],
                        'state': addr[5],
                        'postal_code': addr[6],
                        'country': addr[7],
                        'is_default': addr[8]
                    }
                    for addr in addresses
                ]
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
