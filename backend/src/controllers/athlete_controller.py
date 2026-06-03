import jwt
import logging
from flask import Blueprint, jsonify, request, current_app
from backend.src.services.athlete_service import (
    get_athlete_profile_data,
    save_athlete_profile_data,
    get_modalidades_list,
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


@athlete.route("/api/atleta/perfil", methods=["GET"])
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


@athlete.route("/api/atleta/perfil", methods=["PUT"])
def update_perfil():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401

    data = request.get_json()
    log.debug("Atualizando perfil do atleta. user_id=%s", user_id)
    try:
        save_athlete_profile_data(
            user_id,
            nome=data.get("nome"),
            data_nascimento=data.get("dataNascimento"),
            genero=data.get("genero"),
            modalidade_id=data.get("modalidadeId"),
            peso=data.get("peso"),
            altura=data.get("altura"),
        )
        return jsonify({"message": "Perfil atualizado com sucesso!"}), 200
    except Exception as e:
        log.error("Erro ao atualizar perfil. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao atualizar perfil. {e}"}), 500


@athlete.route("/api/modalidades", methods=["GET"])
def list_modalidades():
    return jsonify(get_modalidades_list()), 200


@athlete.route("/api/equipes", methods=["GET"])
def list_equipes():
    return jsonify([]), 200
