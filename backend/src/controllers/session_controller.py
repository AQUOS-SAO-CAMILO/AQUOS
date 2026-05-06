from flask import Blueprint, jsonify, request
from backend.src.services.session_service import *
from datetime import datetime

session = Blueprint('session', __name__)

@session.route('/session/start', methods=['POST'])
def start_session():
    data = request.get_json()
    athlete_id = data.get('athlete_id')
    intensity = data.get('intensity')
    modality = data.get('modality')
    session_start = data.get('session_start')
    urine_color_pre = data.get('urine_color_pre')
    bladder_emptied = data.get('bladder_emptied')
    clothing_soaked = data.get('clothing_soaked')
    urine_volume_ml = data.get('urine_volume_ml')
    notes = data.get('notes')

    if not athlete_id:
        return jsonify({"message": "Id do atleta é obrigatório."}), 400
    if not modality:
        return jsonify({"message": "Modalidade do atleta é obrigatória."}), 400
    if not intensity:
        return jsonify({"message": "Intensidade do exercício é obrigatória."}), 400
    if not session_start:
        return jsonify({"message": "Data de início da sessão do atleta é obrigatória."}), 400
    if not urine_volume_ml:
        return jsonify({"message": "Quantidade de urina expelida do atleta é obrigatória."}), 400
    if not urine_color_pre:
        return jsonify({"message": "Cor da urina (escala de 1 a 8) do atleta é obrigatória."}), 400
    if not notes:
        return jsonify({"message": "Notas informativas para o atleta são obrigatórias."}), 400
    if bladder_emptied is None:
        return jsonify({"error": "Indicar se bexiga foi esvaziada é obrigatório."}), 400
    if clothing_soaked is None:
        return jsonify({"error": "Indicar se há suor nas roupas é obrigatório."}), 400
    
    try:
        result = create_session_logic(athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar iniciar sessão. {e}"}), 400
    

@session.route('/session/mass', methods=['POST'])
def session_mass():
    data = request.get_json()

    pre_weight_kg = data.get("pre_weight_kg")
    post_weight_kg = data.get("post_weight_kg")
    session_id = data.get('session_id')

    if pre_weight_kg is None or post_weight_kg is None:
        return jsonify({"error": "Os valores de massa devem ser fornecidos para realização do cálculo."}), 400
    
    if not session_id:
        return jsonify({"error": "O usuário precisa ser identificado para realizazção do cálculo"}), 400
    
    try:
        result = session_mass_logic(pre_weight_kg, post_weight_kg, session_id)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar realizar o cálculo de massa, {e}"}), 400

@session.route('/session/metrics', methods=['POST'])
def calculate_metrics():
    data = request.get_json()

    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Id da sessão é obrigatório."}), 400
    
    try:
        session_data = get_session_data(session_id)
        metrics = calculate_session_metrics(session_data)
        save_session_result(session_id, metrics)

        return jsonify(metrics), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao tentar realizar o cálculo de métricas, {e}"}), 400


@session.route('/session/environment', methods=['POST'])
def session_environment():
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
        result = session_environment_logic(temperature_c, humidity_pct, session_id)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar registrar temperatura e umidade, {e}"}), 400

@session.route('/session/fluidIntake', methods=['POST'])
def session_hydration():   
    # Ingestão de fluidos, urina, sede
    data = request.get_json()
    session_id = data.get('session_id')
    fluid_type = data.get('fluid_type', 'water')
    volume_ml = data.get('volume_ml')
    logged_at = data.get('logged_at')

    if not session_id or not volume_ml:
        return jsonify({"error": "Id da sessão do usuário e volume ingerido são obrigatórios!"}), 400

    try:
        result = session_hydration_logic(session_id, volume_ml, fluid_type, logged_at)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar registrar dados hídricos, {e}"})

@session.route('/session/end', methods=['PUT'])
def session_end():
    data = request.get_json()
    session_id = data.get('session_id')
    session_end_str = data.get('session_end')


    if not session_id:
        return jsonify({"error": "Id da sessão é obrigatório!"}), 400
    
    if not session_end_str:
        return jsonify({"error": "Horário de término da sessão é obrigatório!"}), 400
    
    try:
        session_end_dt = datetime.strptime(session_end_str, "%Y-%m-%dT%H:%M:%S")
        result = session_end_logic(session_id, session_end_dt)
        return jsonify(result), 201
    
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar registrar o início da sessão. {e}"})