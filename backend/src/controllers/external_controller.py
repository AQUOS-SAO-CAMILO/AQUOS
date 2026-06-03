from backend.src.services.external_service import get_clima
from flask import Blueprint, jsonify

clima = Blueprint('clima', __name__)

@clima.route('/clima', methods=['GET'])
def get_clima():
    try:
        return jsonify(get_clima())
    except Exception as e:
        return jsonify({"error": f"Erro ao obter dados climáticos: {e}"}), 500