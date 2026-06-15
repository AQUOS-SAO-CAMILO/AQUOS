import jwt, logging
from flask import Blueprint, jsonify, request, current_app
from backend.src.services.admin_service import *

log = logging.getLogger("meuapp")
admin = Blueprint("admin", __name__)

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
    
@admin.route("/admin/perfil", methods=["GET"])
def get_admin_profile():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401

    log.debug("Buscando perfil do admin. user_id=%s", user_id)
    try:
        data = get_admin_profile_data_logic(user_id)
        return jsonify(data), 200
    except Exception as e:
        log.error("Erro ao buscar perfil. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao buscar perfil. {e}"}), 500

    
@admin.route("/admin/perfil", methods=["PUT"])
def save_admin_data():

    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Não autorizado."}), 401

    data = request.get_json()
    log.debug("Atualizando perfil do administrador. user_id=%s", user_id)

    full_name = data.get("full_name")
    birth_date = data.get("birth_date")
    gender = data.get("gender")
    role_title = data.get("role_title")
    team_id = data.get("team_id")

    try:
        result = save_admin_data_logic(user_id, full_name, birth_date, gender, role_title, team_id)
        log.info("Dados do administrador atualizados com sucesso. user_id=%s", user_id)
        return jsonify(result), 200
    except Exception as e:
        log.error("Erro ao atualizar dados do administrador. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao tentar atualizar dados do administrador, {e}"}), 400