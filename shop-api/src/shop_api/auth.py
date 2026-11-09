import os
import bcrypt
import jwt
import psycopg
import functools
from datetime import datetime, timedelta
from typing import Union
from flask import Blueprint, request, jsonify, g
from .db import get_db_connection

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token(user_id: str) -> str:
    """Generate a JWT token for a user."""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def get_user_id_from_token(token: str) -> Union[str, None]:
    """Extract user_id from JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require authentication for a route."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.user_id = user_id
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user."""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    hashed_password = hash_password(password)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (name, email, password_h)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (name, email, hashed_password)
            )
            user_id = cursor.fetchone()[0]
            token = generate_token(user_id)

            return jsonify({
                'message': 'User created successfully',
                'user_id': str(user_id),
                'token': token
            }), 201
    except psycopg.errors.UniqueViolation:
        return jsonify({'error': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, password_h
                FROM users
                WHERE email = %s
                """,
                (email,)
            )
            result = cursor.fetchone()

            if not result:
                return jsonify({'error': 'Invalid credentials'}), 401

            user_id, hashed_password = result

            if not verify_password(password, hashed_password):
                return jsonify({'error': 'Invalid credentials'}), 401

            token = generate_token(user_id)

            return jsonify({
                'message': 'Login successful',
                'user_id': str(user_id),
                'token': token
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
