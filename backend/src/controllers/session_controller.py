from flask import Blueprint, jsonify, request
from backend.src.services.session_service import *
from datetime import datetime
import logging

log = logging.getLogger("meuapp")

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

    log.debug("Requisição de início de sessão recebida. athlete_id=%s | modality=%s | intensity=%s", athlete_id, modality, intensity)

    if not athlete_id:
        log.warning("Id do atleta não informado na requisição de início de sessão.")
        return jsonify({"message": "Id do atleta é obrigatório."}), 400
    if not modality:
        log.warning("Modalidade não informada na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Modalidade do atleta é obrigatória."}), 400
    if not intensity:
        log.warning("Intensidade não informada na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Intensidade do exercício é obrigatória."}), 400
    if not session_start:
        log.warning("Data de início não informada na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Data de início da sessão do atleta é obrigatória."}), 400
    if not urine_volume_ml:
        log.warning("Volume de urina não informado na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Quantidade de urina expelida do atleta é obrigatória."}), 400
    if not urine_color_pre:
        log.warning("Cor da urina não informada na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Cor da urina (escala de 1 a 8) do atleta é obrigatória."}), 400
    if not notes:
        log.warning("Notas não informadas na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"message": "Notas informativas para o atleta são obrigatórias."}), 400
    if bladder_emptied is None:
        log.warning("Campo bladder_emptied não informado na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"error": "Indicar se bexiga foi esvaziada é obrigatório."}), 400
    if clothing_soaked is None:
        log.warning("Campo clothing_soaked não informado na requisição de início de sessão. athlete_id=%s", athlete_id)
        return jsonify({"error": "Indicar se há suor nas roupas é obrigatório."}), 400
    
    try:
        result = create_session_logic(athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes)
        log.info("Sessão iniciada com sucesso. athlete_id=%s", athlete_id)
        return jsonify(result), 201
    
    except Exception as e:
        log.error("Erro ao iniciar sessão. athlete_id=%s | Erro: %s", athlete_id, e)
        return jsonify({"error": f"Erro ao tentar iniciar sessão. {e}"}), 400
    

@session.route('/session/mass', methods=['POST'])
def session_mass():
    data = request.get_json()

    pre_weight_kg = data.get("pre_weight_kg")
    post_weight_kg = data.get("post_weight_kg")
    session_id = data.get('session_id')

    log.debug("Requisição de registro de massa recebida. session_id=%s | pre_weight_kg=%s | post_weight_kg=%s", session_id, pre_weight_kg, post_weight_kg)

    if pre_weight_kg is None or post_weight_kg is None:
        log.warning("Valores de massa ausentes na requisição. session_id=%s", session_id)
        return jsonify({"error": "Os valores de massa devem ser fornecidos para realização do cálculo."}), 400
    
    if not session_id:
        log.warning("Id da sessão não informado na requisição de massa.")
        return jsonify({"error": "O usuário precisa ser identificado para realizazção do cálculo"}), 400
    
    try:
        result = session_mass_logic(pre_weight_kg, post_weight_kg, session_id)
        log.info("Massa registrada com sucesso. session_id=%s", session_id)
        return jsonify(result), 201
    
    except Exception as e:
        log.error("Erro ao registrar massa. session_id=%s | Erro: %s", session_id, e)
        return jsonify({"error": f"Erro ao tentar realizar o cálculo de massa, {e}"}), 400

@session.route('/session/metrics', methods=['POST'])
def calculate_metrics():
    data = request.get_json()

    session_id = data.get('session_id')

    log.debug("Requisição de cálculo de métricas recebida. session_id=%s", session_id)
    
    if not session_id:
        log.warning("Id da sessão não informado na requisição de métricas.")
        return jsonify({"error": "Id da sessão é obrigatório."}), 400
    
    try:
        session_data = get_session_data(session_id)
        metrics = calculate_session_metrics(session_data)
        save_session_result(session_id, metrics)
        log.info("Métricas calculadas e salvas com sucesso. session_id=%s", session_id)

        return jsonify(metrics), 200

    except Exception as e:
        log.error("Erro ao calcular métricas. session_id=%s | Erro: %s", session_id, e)
        return jsonify({"error": f"Erro ao tentar realizar o cálculo de métricas, {e}"}), 400


@session.route('/session/environment', methods=['POST'])
def session_environment():
    # Temperatura e umidade
    data = request.get_json()
    temperature_c = data.get('temperature_c')
    humidity_pct = data.get('humidity_pct')
    session_id = data.get('session_id')

    log.debug("Requisição de dados ambientais recebida. session_id=%s | temperature_c=%s | humidity_pct=%s", session_id, temperature_c, humidity_pct)

    if not session_id:
        log.warning("Id da sessão não informado na requisição de dados ambientais.")
        return jsonify({"error": "O id da sessão precisa ser preenchido."}), 400
    
    if temperature_c is None or humigit pull --rebase origin backenddity_pct is None:
        log.warning("Temperatura ou umidade ausentes na requisição de dados ambientais. session_id=%s", session_id)
        return jsonify({"error": "Os valores de temperatura e umidade precisam ser preenchdo."}), 400
    
    try:
        result = session_environment_logic(temperature_c, humidity_pct, session_id)
        log.info("Dados ambientais registrados com sucesso. session_id=%s", session_id)
        return jsonify(result), 201
    
    except Exception as e:
        log.error("Erro ao registrar dados ambientais. session_id=%s | Erro: %s", session_id, e)
        return jsonify({"error": f"Erro ao tentar registrar temperatura e umidade, {e}"}), 400

@session.route('/session/fluidIntake', methods=['POST'])
def session_hydration():   
    # Ingestão de fluidos, urina, sede
    data = request.get_json()
    session_id = data.get('session_id')
    fluid_type = data.get('fluid_type', 'water')
    volume_ml = data.get('volume_ml')
    logged_at = data.get('logged_at')

    log.debug("Requisição de registro de hidratação recebida. session_id=%s | volume_ml=%s | fluid_type=%s", session_id, volume_ml, fluid_type)

    if not session_id or not volume_ml:
        log.warning("Id da sessão ou volume ausentes na requisição de hidratação. session_id=%s", session_id)
        return jsonify({"error": "Id da sessão do usuário e volume ingerido são obrigatórios!"}), 400

    try:
        result = session_hydration_logic(session_id, volume_ml, fluid_type, logged_at)
        log.info("Hidratação registrada com sucesso. session_id=%s | volume_ml=%s | fluid_type=%s", session_id, volume_ml, fluid_type)
        return jsonify(result), 201
    
    except Exception as e:
        log.error("Erro ao registrar hidratação. session_id=%s | Erro: %s", session_id, e)
        return jsonify({"error": f"Erro ao tentar registrar dados hídricos, {e}"})

@session.route('/session/end', methods=['PUT'])
def session_end():
    data = request.get_json()
    session_id = data.get('session_id')
    session_end_str = data.get('session_end')

    log.debug("Requisição de finalização de sessão recebida. session_id=%s | session_end=%s", session_id, session_end_str)

    if not session_id:
        log.warning("Id da sessão não informado na requisição de finalização.")
        return jsonify({"error": "Id da sessão é obrigatório!"}), 400
    
    if not session_end_str:
        log.warning("Horário de término não informado na requisição de finalização. session_id=%s", session_id)
        return jsonify({"error": "Horário de término da sessão é obrigatório!"}), 400
    
    try:
        session_end_dt = datetime.strptime(session_end_str, "%Y-%m-%dT%H:%M:%S")
        result = session_end_logic(session_id, session_end_dt)
        log.info("Sessão finalizada com sucesso. session_id=%s", session_id)
        return jsonify(result), 201
    
    except Exception as e:
        log.error("Erro ao finalizar sessão. session_id=%s | Erro: %s", session_id, e)
        return jsonify({"error": f"Erro ao tentar registrar o início da sessão. {e}"})