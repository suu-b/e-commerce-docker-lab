from flask import Flask, jsonify

app = Flask(__name__)

# Register blueprints
from .auth import auth_bp
from .addresses import addresses_bp
from .orders import orders_bp
from .payments import payments_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(addresses_bp, url_prefix='/api')
app.register_blueprint(orders_bp, url_prefix='/api')
app.register_blueprint(payments_bp, url_prefix='/api')

@app.route("/")
def home():
    return jsonify({
        "message": "ok"
    })

@app.route("/health")
def health():
    return jsonify({
        "message": "Running healthy"
    })

if __name__ == "__main__":
    app.run(debug=True)

