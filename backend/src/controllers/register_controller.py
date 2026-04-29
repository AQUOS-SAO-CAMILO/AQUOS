from flask import Blueprint, jsonify, request
from backend.src.services.register_service import register_mass_logic, register_environment_logic

register = Blueprint('register', __name__)

@register.route('/register-mass', methods=['POST'])
def register_mass():
    data = request.get_json()

    pre_weight_kg = data.get("pre_weight_kg")
    pos_weight_kg = data.get("post_weight_kg")
    user_id = data.get('user_id')

    if pre_weight_kg is None or pos_weight_kg is None:
        return jsonify({"error": "Os valores de massa devem ser fornecidos para realização do cálculo."}), 400
    
    if not user_id:
        return jsonify({"error": "O usuário precisa ser identificado para realizazção do cálculo"}), 400
    
    try:
        result = register_mass_logic(pre_weight_kg, pos_weight_kg, user_id)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar realizar o cálculo de massa, {e}"}), 400


@register.route('/register-environment', methods=['POST'])
def register_environment():
    # Temperatura e umidade
    data = request.get_json()
    temperature_c = data.get('temperature_c')
    humidity_pct = data.get('humidity_pct')
    session_id = data.get('session_id')

    if not session_id:
        return jsonify({"error": "O id da sessão precisa ser preenchido."}), 400
    
    if temperature_c is None or humidity_pct is None:
        return jsonify({"error": "Os valores de temperatura e umidade precisam ser preenchdo."}), 400
    
    try:
        result = register_environment_logic(temperature_c, humidity_pct, session_id)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar registrar temperatura e umidade, {e}"}), 400

@register.route('/register-hydration', methods=['POST'])
def register_hydration():   
    # Ingestão de fluidos, urina, sede
    data = request.get_json()


@register.route('/calculate-metrics', methods=['POST'])
def calculate_metrics():
    # Taxa de sudorese, balanço hídrico, recomendações
    pass