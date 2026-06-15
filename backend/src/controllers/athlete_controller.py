import jwt
import logging
from flask import Blueprint, jsonify, request, current_app
from backend.src.services.athlete_service import (
    get_athlete_profile_data,
    save_athlete_profile_data,
    get_atletas_em_risco
)

log = logging.getLogger("meuapp")

athlete = Blueprint("athlete", __name__)


def _get_user_id():
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload.get("User_id")
    except Exception:
        return None


@athlete.route("/atleta/perfil", methods=["GET"])
def get_perfil():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401

    log.debug("Buscando perfil do atleta. user_id=%s", user_id)
    try:
        data = get_athlete_profile_data(user_id)
        return jsonify(data), 200
    except Exception as e:
        log.error("Erro ao buscar perfil. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao buscar perfil. {e}"}), 500


@athlete.route("/atleta/perfil", methods=["PUT"])
def update_perfil():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401

    data = request.get_json()
    log.debug("Atualizando perfil do atleta. user_id=%s", user_id)
    try:
        save_athlete_profile_data(
            user_id,
            name=data.get("name"),
            birth_date=data.get("birth_date"),
            gender=data.get("gender"),
            sport_modality=data.get("sport_modality"),
            body_weight_kg=data.get("body_weight_kg"),
            height_cm=data.get("height_cm"),
        )
        log.info("Dados do atleta atualizados com sucesso. user_id=%s", user_id)
        return jsonify({"message": "Perfil atualizado com sucesso!"}), 200
    except Exception as e:
        log.error("Erro ao atualizar perfil. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao atualizar perfil. {e}"}), 500

@athlete.route("/alertas/atletas-risco", methods=["GET"])
def atletas_em_risco():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401
 
    try:
        quantidade = get_atletas_em_risco()
        return jsonify({"quantidade": quantidade}), 200
    except Exception as e:
        log.error("Erro ao buscar atletas em risco. Erro: %s", e)
        return jsonify({"error": f"Erro ao buscar atletas em risco. {e}"}), 500