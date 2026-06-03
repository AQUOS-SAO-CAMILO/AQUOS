import logging
import jwt
from flask import request, jsonify, current_app

log = logging.getLogger("meuapp")

def init_middlewares(app):
    
    @app.before_request
    def check_authentication():
        
        if request.method == "OPTIONS":
        return None

        public_endpoints = ['login.authenticate_user', 'login.register_user', 
            'hello_world', 'clima.get_clima']

        if request.endpoint in public_endpoints:
                return None

        auth_header = request.headers.get("Authorization") 
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Acesso não autorizado"}), 401
        
        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user_id = payload.get("User_id")
            request.user_role = payload.get("role")
            log.info(f"Token validado. Usuário: {request.user_id} | role: {request.user_role}")
        except jwt.ExpiredSignatureError:
            log.warning("Token expirado.")
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            log.warning("Token inválido.")
            return jsonify({"error": "Token inválido"}), 401
        
    @app.after_request
    def log_response(response):
        log.info(f"Outgoing response: {response.status_code}")
        return response

    @app.teardown_request
    def check_teardown(exception=None):
        if exception:
            log.error(f"Exception during request teardown: {exception}")
        else:
            log.info("Request teardown completed successfully")
